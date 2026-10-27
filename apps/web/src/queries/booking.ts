import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  BookingDetails,
  Availability,
  BookingInput,
} from "../types/Booking";
import { useAuth } from "../hooks/useAuth";
import type { Paginated } from "../types/Paginated";

export function useAvailability(resourceId: string, date: string) {
  return useQuery({
    queryKey: ["availability", resourceId, date],
    queryFn: () => {
      const from = new Date(`${date}T00:00`);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return api.get<Availability>(
        `/businesses/availability/${resourceId}?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
    },
    enabled: !!date,
  });
}

export function createBooking(input: BookingInput) {
  return api.post<{ booking: { id: string }; clientSecret: string }>(
    "/bookings",
    input,
  );
}

export function useBooking(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => api.get<BookingDetails>(`/bookings/${bookingId}`),
    enabled: enabled && !!bookingId,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING_PAYMENT" ? 2000 : false,
  });
}

export function useMyBookings(page: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["booking", "mine", user?.id, page],
    queryFn: () =>
      api.get<Paginated<BookingDetails>>(`/bookings/mine?page=${page}`),
    enabled: !!user,
  });
}

export function useBusinessBookings(page: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["booking", "business", "mine", user?.id, page],
    queryFn: () =>
      api.get<Paginated<BookingDetails>>(
        `/bookings/business/mine?page=${page}`,
      ),
    enabled: !!user,
  });
}

export function cancelBooking(bookingId: string) {
  return api.patch<BookingDetails>(`/bookings/${bookingId}/cancel`);
}

export function updateBookingStatus(
  bookingId: string,
  status: "COMPLETED" | "NO_SHOW",
) {
  return api.patch<BookingDetails>(`/bookings/${bookingId}/status`, { status });
}
