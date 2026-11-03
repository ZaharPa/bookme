import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { cancelBooking, useMyBookings } from "../queries/booking";
import Pagination from "../components/Pagination";
import { formatRange } from "../utils/format";
import BookingStatus from "../components/BookingStatus";

export default function MyBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const queryClient = useQueryClient();

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const { data, isPending, isError, error, isPlaceholderData } =
    useMyBookings(page);

  const { mutate: cancel, isPending: isCancelling } = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["booking"] }),
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
      ]),
  });

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );

  return (
    <div>
      <h1>My Bookings</h1>
      {data.items.length === 0 ? (
        <p className="mt-6 muted">No bookings yet</p>
      ) : (
        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Amount</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((booking) => (
                <tr key={booking.id}>
                  <td className="tabular-nums">
                    <Link to={`/bookings/${booking.id}`} className="link">
                      {formatRange(booking.startTime, booking.endTime)}
                    </Link>
                  </td>
                  <td>
                    <BookingStatus status={booking.status} />
                  </td>
                  <td className="text-right">
                    {(booking.status === "PENDING_PAYMENT" ||
                      booking.status === "CONFIRMED") && (
                      <button
                        onClick={() => {
                          if (window.confirm("Cancel this booking"))
                            cancel(booking.id);
                        }}
                        disabled={isCancelling}
                        className="btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
