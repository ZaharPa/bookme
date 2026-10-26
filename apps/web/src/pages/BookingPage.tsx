import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { useBusiness } from "../queries/business";
import { createBooking, useAvailability } from "../queries/booking";
import { toMinutes } from "../utils/time";
import AvailabilityMap from "../components/AvailabilityMap";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function BookingPage() {
  const { businessId, locationId, resourceId } = useParams();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{error.message}</p>;

  const location = business.locations.find((l) => l.id === locationId);
  const resource = location?.resources.find((r) => r.id === resourceId);
  if (!location && !resource) return <p>Resource not found</p>;

  const hours = date
    ? location?.openingHours[DAY_KEYS[new Date(`${date}T00:00`).getDay()]]
    : null;
  const minutes = from && to ? toMinutes(to) - toMinutes(from) : 0;
  const price = ((resource!.priceCents * minutes) / 60 / 100).toFixed(2);

  const submit = () =>
    booking.mutate({
      resourceId: resourceId!,
      startTime: new Date(`${date}T${from}`).toISOString(),
      endTime: new Date(`${date}T${to}`).toISOString(),
    });

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {business.name} {resource?.name}{" "}
      </h1>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {date && availability.isPending && <p>Loading...</p>}
      {availability.isError && (
        <p className="text-red-600">{availability.error.message}</p>
      )}
      {date && availability.data && (
        <AvailabilityMap
          date={date}
          hours={hours ?? null}
          capacity={availability.data.capacity}
          booked={availability.data.booked}
        />
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="time"
          step={900}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="time"
          step={900}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {minutes > 0 && <p>Estimated price : {price}</p>}

      <button
        onClick={submit}
        disabled={minutes <= 0 || booking.isPending}
        className="border p-2 cursor-pointer"
      >
        {booking.isPending ? "Booking.." : "Book"}
      </button>

      {booking.isError && (
        <p className="text-red-600">{booking.error.message}</p>
      )}
      {booking.isSuccess && <p>Booking created next step payment</p>}
    </div>
  );
}
