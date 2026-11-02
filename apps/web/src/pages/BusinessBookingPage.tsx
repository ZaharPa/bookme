import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { updateBookingStatus, useBusinessBookings } from "../queries/booking";
import Pagination from "../components/Pagination";
import { formatPrice, formatRange } from "../utils/format";
import BookingStatus from "../components/BookingStatus";

export default function BusinessBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const queryClient = useQueryClient();

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const { data, isPending, isError, error, isPlaceholderData } =
    useBusinessBookings(page);

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "COMPLETED" | "NO_SHOW";
    }) => updateBookingStatus(bookingId, status),
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
      <h1>Business Bookings</h1>
      <p className="muted mt-1">
        After a booking starts, mark whether the customer came.
      </p>

      {data.items.length === 0 ? (
        <p className="muted mt-6">No bookings yet</p>
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
                    {formatRange(booking.startTime, booking.endTime)}
                  </td>
                  <td className="tabular-nums">
                    {formatPrice(booking.totalAmountCents)}
                  </td>
                  <td>
                    <BookingStatus status={booking.status} />
                  </td>
                  <td>
                    {booking.status === "CONFIRMED" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateStatus({
                              bookingId: booking.id,
                              status: "COMPLETED",
                            })
                          }
                          disabled={isUpdating}
                          className="btn-secondary"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Mark as no-show? The customer's card will be charged.",
                              )
                            )
                              updateStatus({
                                bookingId: booking.id,
                                status: "NO_SHOW",
                              });
                          }}
                          disabled={isUpdating}
                          className="btn-danger"
                        >
                          No-show
                        </button>
                      </div>
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
