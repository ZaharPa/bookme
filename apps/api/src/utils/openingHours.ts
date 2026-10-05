type DayHours = { open: string; close: string } | null;
export type OpeningHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  DayHours
>;

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;

  return {
    day: get("weekday").toLowerCase() as keyof OpeningHours,
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h! * 60 + m!;
}

export function isWithinOpeningHours(
  start: Date,
  end: Date,
  timeZone: string,
  hours: OpeningHours,
): boolean {
  const s = localParts(start, timeZone);
  const e = localParts(end, timeZone);

  if (s.date !== e.date) return false;

  const day = hours[s.day];
  if (!day) return false;

  return s.minutes >= toMinutes(day.open) && e.minutes <= toMinutes(day.close);
}
