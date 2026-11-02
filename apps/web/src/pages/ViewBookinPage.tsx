import { Link, useParams } from "react-router";
import { useBooking } from "../queries/booking";
import { formatPrice, formatRange } from "../utils/format";
import BookingStatus from "../components/BookingStatus";

export default function ViewBookingPage() {
  const { bookingId } = useParams();

  const { data, isPending, isError, error } = useBooking(bookingId!);

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );

  return (
    <div className="max-w-lg">
      <Link to="/bookings/mine" className="link muted">
        My bookings
      </Link>
      <h1 className="mt-1">Booking</h1>

      <dl className="sheet mt-6">
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">When</dt>
          <dd className="tabular-nums">
            {formatRange(data.startTime, data.endTime)}
          </dd>
        </div>
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">Amount</dt>
          <dd className="tabular-nums">{formatPrice(data.totalAmountCents)}</dd>
        </div>
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">Status</dt>
          <dd>
            <BookingStatus status="data.status" />
          </dd>
        </div>
      </dl>

      {data.status === "PENDING_PAYMENT" && (
        <p className="muted mt-4">
          This booking is waiting for payment. If it is not paid in time, it
          expires and the time becomes free again.
        </p>
      )}
    </div>
  );
}
