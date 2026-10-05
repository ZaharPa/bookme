import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import type Stripe from "stripe";
import { stripe } from "../utils/stripe";
import { db } from "../prisma/db";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return errorResponse(res, 400, "Missing signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
  } catch {
    return errorResponse(res, 400, "Invalid signature");
  }

  if (event.type === "payment_intent.amount_capturable_updated") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    const cofrimed = await db.orm.public.Booking.where({
      id: bookingId,
      status: "PENDING_PAYMENT",
    }).update({ status: "CONFIRMED" });

    if (!cofrimed) {
      await stripe.paymentIntents.cancel(intent.id);
    }
  }
  return successResponse(res, 200, { receiced: true });
}
