import { humanize } from "../utils/format";

const MUTED = ["CANCELLED", "EXPIRED", "COMPLETED"];

export default function BookingStatus({ status }: { status: string }) {
  return (
    <span className={MUTED.includes(status) ? "text-muted" : "font-semibold"}>
      {humanize(status)}
    </span>
  );
}
