import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { acquireLock, releaseLock } from "../redis/lock";
import type { Booking, BookingStatus } from "../schemas/booking";
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

  const lockKey = `lock:resource:${resource.id}`;
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

export async function viewMyBookings(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;
  const bookings = await db.orm.public.Booking.where({
    customerId: req.user!.userId,
  })
    .orderBy((b) => b.startTime.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();
  return successResponse(res, 200, bookings);
}

export async function viewBusinessBookings(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;

  const businesses = await db.orm.public.Business.where({
    ownerId: req.user!.userId,
  })
    .include("locations", (location) => location.include("resources"))
    .all();

  const resourcesId = businesses.flatMap((business) =>
    business.locations.flatMap((location) =>
      location.resources.map((resource) => resource.id),
    ),
  );

  if (resourcesId.length === 0) return successResponse(res, 200, []);

  const bookings = await db.orm.public.Booking.where((b) =>
    b.resourceId.in(resourcesId),
  )
    .orderBy((b) => b.startTime.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  return successResponse(res, 200, bookings);
}

export async function viewBooking(
  req: Request<{ bookingId: string }>,
  res: Response,
) {
  const booking = await db.orm.public.Booking.where({
    id: req.params.bookingId,
  }).first();

  return successResponse(res, 200, booking);
}

export async function cancelBooking(
  req: Request<{ bookingId: string }>,
  res: Response,
) {
  const booking = await db.orm.public.Booking.where({
    id: req.params.bookingId,
    customerId: req.user!.userId,
  }).first();
  if (!booking) return errorResponse(res, 400, "Booking not found");

  if (booking.status !== "PENDING_PAYMENT" && booking.status !== "CONFIRMED") {
    return errorResponse(res, 409, "Booking cannot be cancelled");
  }

  if (booking.status == "CONFIRMED") {
    const resource = await db.orm.public.Resource.where({
      id: booking.resourceId,
    }).first();
    const location =
      resource &&
      (await db.orm.public.Location.where({
        id: resource?.locationId,
      }).first());
    const business =
      location &&
      (await db.orm.public.Business.where({ id: location.businessId }).first());
    if (!business) return errorResponse(res, 404, "Business not found");

    const deadline = new Date(
      new Date(booking.startTime).getTime() -
        business.cancellationWindowHours * 3600000,
    );
    if (new Date() > deadline) {
      return errorResponse(res, 409, "Too late to cancel this booking");
    }
  }

  const cancelled = await db.orm.public.Booking.where({
    id: booking.id,
    status: booking.status,
  }).update({ status: "CANCELLED" });

  if (!cancelled) {
    return errorResponse(res, 409, "Booking status changed, try againg");
  }

  if (booking.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
    } catch (error) {
      console.error("Failed to cancel payment intent", error);
    }
  }
  return successResponse(res, 200, cancelled, "Booking canceled successfully");
}

export async function updateBookingStatus(
  req: Request<{ bookingId: string }, {}, BookingStatus>,
  res: Response,
) {
  const { status } = req.body;

  const booking = await db.orm.public.Booking.where({
    id: req.params.bookingId,
  }).first();
  if (!booking) return errorResponse(res, 404, "Booking not found");

  const resource = await db.orm.public.Resource.where({
    id: booking.resourceId,
  }).first();
  const location =
    resource &&
    (await db.orm.public.Location.where({
      id: resource?.locationId,
    }).first());
  const business =
    location &&
    (await db.orm.public.Business.where({ id: location.businessId }).first());
  if (!business || business.ownerId !== req.user!.userId)
    return errorResponse(res, 404, "Business not found");

  if (booking.status !== "CONFIRMED")
    return errorResponse(res, 409, "Only confrimed bookings can be updated");

  if (new Date(booking.startTime) > new Date())
    return errorResponse(res, 409, "Booking has not started yet");

  const updated = await db.orm.public.Booking.where({
    id: booking.id,
    status: "CONFIRMED",
  }).update({ status });
  if (!updated)
    return errorResponse(res, 409, "Booking status changet, try again");

  if (booking.stripePaymentIntentId) {
    try {
      if (status === "NO_SHOW") {
        await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
      } else {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      }
    } catch (error) {
      console.error("Stripe error on status update", error);
      if (status === "NO_SHOW") {
        await db.orm.public.Booking.where({ id: booking.id }).update({
          status: "CONFIRMED",
        });
        return errorResponse(res, 502, "Payment procider error, try again");
      }
    }
  }

  return successResponse(res, 200, updated, "Booking status updated");
}
