import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useBusiness } from "../queries/business";
import { createBooking, useAvailability, useBooking } from "../queries/booking";
import { todayAsValue, toMinutes } from "../utils/time";
import AvailabilityMap from "../components/AvailabilityMap";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import PaymentForm from "../components/PaymentForm";
import { formatPrice, formatRange } from "../utils/format";
import { DAY_KEYS } from "../utils/days";

export default function BookingPage() {
  const { businessId, locationId, resourceId } = useParams();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paid, setPaid] = useState(false);

  const {
    data: business,
    isPending,
    isError,
    error,
  } = useBusiness(businessId!);
  const availability = useAvailability(resourceId!, date);
  const booking = useMutation({
    mutationFn: createBooking,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["availability", resourceId] }),
  });

  const confirmed = useBooking(booking.data?.booking.id ?? "", paid);

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );

  const location = business.locations.find((l) => l.id === locationId);
  const resource = location?.resources.find((r) => r.id === resourceId);
  if (!location || !resource)
    return <p className="muted">Resource not found</p>;

  const today = todayAsValue();
  const hours = date
    ? location?.openingHours[DAY_KEYS[new Date(`${date}T00:00`).getDay()]]
    : null;
  const minutes = from && to ? toMinutes(to) - toMinutes(from) : 0;
  const price = ((resource!.priceCents * minutes) / 60 / 100).toFixed(2);
  const locked = !!booking.data;

  const submit = () =>
    booking.mutate({
      resourceId: resourceId!,
      startTime: new Date(`${date}T${from}`).toISOString(),
      endTime: new Date(`${date}T${to}`).toISOString(),
    });

  return (
    <div className="max-w-3xl">
      <Link to={`/businesses/${business.id}`} className="link muted">
        {business.name}
      </Link>
      <h1 className="mt-1">{resource.name}</h1>
      <p className="muted mt-1">
        {location.address}, {location.city} . {formatPrice(resource.priceCents)}{" "}
        per hour
      </p>
      <section className="mt-8">
        <h2>Day</h2>
        <label className="mt-3 block max-w-xs">
          <span className="label">Date</span>
          <input
            type="date"
            min={today}
            value={date}
            disabled={locked}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </label>
      </section>
      {date && (
        <section className="mt-8">
          <h2>Time</h2>

          {availability.isPending && <p className="muted mt-3">Loading...</p>}
          {availability.isError && (
            <p role="alert" className="field-error mt-3">
              {availability.error.message}
            </p>
          )}
          {availability.data && (
            <div className="mt-3">
              <AvailabilityMap
                date={date}
                hours={hours ?? null}
                capacity={availability.data.capacity}
                booked={availability.data.booked}
                from={from}
                to={to}
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <label>
              <span className="label">From</span>
              <input
                type="time"
                step={900}
                value={from}
                disabled={locked}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              <span className="label">To</span>
              <input
                type="time"
                step={900}
                value={to}
                disabled={locked}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>

          {from && to && minutes <= 0 && (
            <p className="field-error">
              The end time must be after the start time
            </p>
          )}

          {minutes > 0 && (
            <p className="mt-4">
              <span className="muted">Price</span>
              <span className="text-2xl font-semibold tabular-nums">
                {price}
              </span>
            </p>
          )}

          {!locked && (
            <button
              onClick={submit}
              disabled={minutes <= 0 || booking.isPending}
              className="btn mt-4"
            >
              {booking.isPending ? "Booking.." : "Continue to payment"}
            </button>
          )}
        </section>
      )}
      {booking.data && !paid && (
        <section className="mt-8">
          <h2>Payment</h2>
          <p className="muted mt-1">
            Your time is held while you pay. The amount is held on your card,
            and you are charged only if you do not show up.
          </p>
          <div className="panel mt-4 max-w-md">
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: booking.data.clientSecret }}
            >
              <PaymentForm onPaid={() => setPaid(true)} />
            </Elements>
          </div>
        </section>
      )}
      {paid &&
        (!confirmed.data || confirmed.data?.status === "PENDING_PAYMENT") && (
          <p role="status" className="muted mt-8">
            Waiting for confirmation...
          </p>
        )}
      {confirmed.isError && (
        <p role="alert" className="field-error mt-8">
          {confirmed.error.message}
        </p>
      )}
      {confirmed.data?.status === "CONFIRMED" && (
        <div className="panel mt-8" role="status">
          <h2>Booking confirmed</h2>
          <p className="muted mt-1">
            {resource.name} at {business.name}.
            {formatRange(confirmed.data.startTime, confirmed.data.endTime)}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/bookings/mine" className="btn">
              My bookings
            </Link>
            <Link to={`/businesses/${business.id}`} className="btn-secondary">
              Back to {business.name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
