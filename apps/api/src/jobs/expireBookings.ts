import { HOLD_MINUTES } from "../config/booking";
import { db } from "../prisma/db";
import { stripe } from "../utils/stripe";

export async function expireBookings() {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60000).toISOString();

  const stale = await db.orm.public.Booking.where({ status: "PENDING_PAYMENT" })
    .where((b) => b.createdAt.lt(cutoff))
    .all();

  for (const booking of stale) {
    const expired = await db.orm.public.Booking.where({
      id: booking.id,
      status: "PENDING_PAYMENT",
    }).update({ status: "EXPIRED" });

    if (expired && booking.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      } catch {}
    }
  }
}
