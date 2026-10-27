import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { cancelBooking, useMyBookings } from "../queries/booking";
import Pagination from "../components/Pagination";

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

  const {
    mutate: cancel,
    isPending: isCancelling,
    error: cancelError,
  } = useMutation({
    mutationFn: cancelBooking,
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
              <Link
                to={`/bookings/${booking.id}`}
                className="col-span-3 grid grid-cols-3"
              >
                <div>
                  {booking.startTime} - {booking.endTime}
                </div>
                <div>{booking.totalAmountCents}</div>
                <div>{booking.status}</div>
              </Link>

              {(booking.status === "PENDING_PAYMENT" ||
                booking.status === "CONFIRMED") && (
                <button
                  onClick={() => {
                    if (window.confirm("Cancel this booking"))
                      cancel(booking.id);
                  }}
                  disabled={isCancelling}
                  className="border p-2 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {cancelError && <p className="text-red-600">{cancelError.message}</p>}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
