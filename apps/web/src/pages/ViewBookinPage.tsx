import { useParams } from "react-router";
import { useBooking } from "../queries/booking";

export default function ViewBookingPage() {
  const { bookingId } = useParams();

  const { data, isPending, isError, error } = useBooking(bookingId!);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{error.message}</p>;

  return (
    <div>
      {data.startTime} - {data.endTime}
      {data.totalAmountCents}
    </div>
  );
}
