export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function parseDbDate(value: string) {
  return new Date(
    value
      .replace(" ", "T")
      .replace(/(\.\d{3})\d+/, "$1")
      .replace(/([+-]\d{2})$/, "$1:00"),
  );
}
