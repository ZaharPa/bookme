import { parseDbDate, toMinutes, toTime } from "../utils/time";

type Props = {
  date: string;
  hours: { open: string; close: string } | null;
  capacity: number;
  booked: { startTime: string; endTime: string }[];
};

export default function AvailabilityMap({
  date,
  hours,
  capacity,
  booked,
}: Props) {
  if (!hours) return <p>Closed This day</p>;

  const ranges = booked.map((b) => ({
    start: parseDbDate(b.startTime),
    end: parseDbDate(b.endTime),
  }));

  const slots: { time: string; busy: boolean }[] = [];
  for (let m = toMinutes(hours.open); m < toMinutes(hours.close); m += 15) {
    const start = new Date(`${date}T${toTime(m)}`);
    const end = new Date(start.getTime() + 15 * 60000);
    const count = ranges.filter((r) => r.start < end && r.end > start).length;
    slots.push({ time: toTime(m), busy: count >= capacity });
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {slots.map((s) => (
        <div
          key={s.time}
          className={`w-14 p-1 text-center text-xs ${s.busy ? "bg-red-300" : "bg-green-300"}`}
        >
          {s.time}
        </div>
      ))}
    </div>
  );
}
