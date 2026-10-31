import { parseDbDate, toMinutes, toTime } from "../utils/time";

type Props = {
  date: string;
  hours: { open: string; close: string } | null;
  capacity: number;
  booked: { startTime: string; endTime: string }[];
  from: string;
  to: string;
};

type State = "free" | "busy" | "picked";

const CELL: Record<State, string> = {
  free: "bg-white border-line",
  busy: "bg-busy-soft border-busy/40",
  picked: "bg-mark border-mark",
};

const LABEL: Record<State, string> = {
  free: "Free",
  busy: "Booked",
  picked: "Your time",
};

export default function AvailabilityMap({
  date,
  hours,
  capacity,
  booked,
  from,
  to,
}: Props) {
  if (!hours) return <p className="muted">Closed This day</p>;

  const ranges = booked.map((b) => ({
    start: parseDbDate(b.startTime),
    end: parseDbDate(b.endTime),
  }));

  const pickedFrom = from ? toMinutes(from) : 0;
  const pickedTo = to ? toMinutes(to) : 0;
  const byHour = new Map<number, { time: string; state: State }[]>();

  for (let m = toMinutes(hours.open); m < toMinutes(hours.close); m += 15) {
    const start = new Date(`${date}T${toTime(m)}`);
    const end = new Date(start.getTime() + 15 * 60000);
    const count = ranges.filter((r) => r.start < end && r.end > start).length;

    const state: State =
      count >= capacity
        ? "busy"
        : m >= pickedFrom && m < pickedTo
          ? "picked"
          : "free";

    const hour = Math.floor(m / 60);
    byHour.set(hour, [...(byHour.get(hour) ?? []), { time: toTime(m), state }]);
  }

  return (
    <div className="border border-line bg-white p-4">
      <div
        role="group"
        aria-label={`Availabilty on ${date}`}
        className="flex flex-wrap gap-x-2 gap-y-4"
      >
        {[...byHour].map(([hour, cells]) => (
          <div key={hour}>
            <div className="mb-1 text-xs tabular-nums text-muted">
              {toTime(hour * 60)}
            </div>
            <div className="flex">
              {cells.map((c) => (
                <div
                  key={c.time}
                  title={`${c.time}, ${LABEL[c.state].toLowerCase()}`}
                  className={`-mr-px h-10 w-3.5 border ${CELL[c.state]}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-4 flex gap-5 text-sm">
        {(["free", "busy", "picked"] as const).map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`size-4 border ${CELL[s]}`} />
            {LABEL[s]}
          </li>
        ))}
      </ul>
    </div>
  );
}
