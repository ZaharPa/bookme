import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { acquireLock, releaseLock } from "../redis/lock";
import type { Booking } from "../schemas/booking";
import { and, or } from "@prisma/orm-postgres/orm-client";
import { isWithinOpeningHours, type OpeningHours } from "../utils/openingHours";
import { HOLD_MINUTES } from "../config/booking";
import { stripe } from "../utils/stripe";

export async function createBooking(
  req: Request<{}, {}, Booking>,
  res: Response,
) {
  const { resourceId, startTime, endTime } = req.body;

  if (startTime <= new Date()) {
    return errorResponse(res, 400, "Start time must be in future");
  }

  const resource = await db.orm.public.Resource.where({
    id: resourceId,
    deletedAt: null,
  }).first();
  if (!resource) {
    return errorResponse(res, 404, "Resource not found");
  }

  const location = await db.orm.public.Location.where({
    id: resource.locationId,
    deletedAt: null,
  }).first();
  if (!location) {
    return errorResponse(res, 404, "Location not found");
  }

  if (
    !isWithinOpeningHours(
      startTime,
      endTime,
      location.timezone,
      location.openingHours as OpeningHours,
    )
  ) {
    return errorResponse(res, 400, "Booking is outside opening hours");
  }

  const minutes = (endTime.getTime() - startTime.getTime()) / 60000;
  const totalAmountCents = Math.round((resource.priceCents * minutes) / 60);

  const start = startTime.toISOString();
  const end = endTime.toISOString();
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60000).toISOString();

  const lockKey = `lock:resource:${resource.id}:${start.slice(0, 10)}`;
  const token = await acquireLock(lockKey);
  if (!token)
    return errorResponse(res, 409, "Resource is busy, try again later");

  let booking;
  try {
    const overlapping = await db.orm.public.Booking.where({
      resourceId: resource.id,
    })
      .where((b) => b.startTime.lt(end))
      .where((b) => b.endTime.gt(start))
      .where((b) =>
        or(
          b.status.eq("CONFIRMED"),
          and(b.status.eq("PENDING_PAYMENT"), b.createdAt.gte(holdCutoff)),
        ),
      )
      .aggregate((a) => ({ total: a.count() }));
    if (overlapping.total >= (resource.capacity ?? 1)) {
      return errorResponse(res, 409, "This time is already booked");
    }

    booking = await db.orm.public.Booking.create({
      customerId: req.user!.userId,
      resourceId: resource.id,
      startTime: start,
      endTime: end,
      totalAmountCents,
      status: "PENDING_PAYMENT",
    });
  } finally {
    await releaseLock(lockKey, token);
  }

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: booking.totalAmountCents,
        currency: "eur",
        capture_method: "manual",
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        metadata: { bookingId: booking.id },
      },
      {
        idempotencyKey: `booking-${booking.id}`,
      },
    );

    await db.orm.public.Booking.where({ id: booking.id }).update({
      stripePaymentIntentId: intent.id,
    });

    return successResponse(
      res,
      201,
      { booking, clientSecret: intent.client_secret },
      "Booking created",
    );
  } catch (error) {
    await db.orm.public.Booking.where({ id: booking.id }).update({
      status: "CANCELLED",
    });

    return errorResponse(res, 502, "Payment provider error");
  }
}
