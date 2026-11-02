import { parseDbDate } from "./time";

export function humanize(value: string) {
  const text = value.replace(/_/g, "").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});
export const formatPrice = (cents: number) => euro.format(cents / 100);

const dayFormat = new Intl.DateTimeFormat("en-IE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("en-IE", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatRange(start: string, end: string) {
  const from = parseDbDate(start);
  const to = parseDbDate(end);
  return `${dayFormat.format(from)}, ${timeFormat.format(from)}-${timeFormat.format(to)}`;
}
