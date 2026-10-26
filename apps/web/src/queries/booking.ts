import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  BookingDetails,
  Availability,
  BookingInput,
} from "../types/Booking";

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
