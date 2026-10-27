import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { updateBookingStatus, useBusinessBookings } from "../queries/booking";
import Pagination from "../components/Pagination";

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

  const {
    mutate: updateStatus,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
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

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">My Bookings</h1>
      {data.items.length === 0 ? (
        <p className="mt-4">No bookings yet</p>
      ) : (
        <ul>
          {data.items.map((booking) => (
            <li key={booking.id} className="grid grid-cols-4">
              <div>
                {booking.startTime} - {booking.endTime}
              </div>
              <div>{booking.totalAmountCents}</div>
              <div>{booking.status}</div>
              {(booking.status === "PENDING_PAYMENT" ||
                booking.status === "CONFIRMED") && (
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      updateStatus({
                        bookingId: booking.id,
                        status: "COMPLETED",
                      })
                    }
                    disabled={isUpdating}
                    className="border p-2 cursor-pointer"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() =>
                      updateStatus({
                        bookingId: booking.id,
                        status: "NO_SHOW",
                      })
                    }
                    disabled={isUpdating}
                    className="border p-2 cursor-pointer"
                  >
                    Uncompleted
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {updateError && <p className="text-red-600">{updateError.message}</p>}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
