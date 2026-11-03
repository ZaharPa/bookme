import { toMinutes } from "../utils/time";

type Props = {
  hours: { open: string; close: string } | null | undefined;
};

export default function HoursBar({ hours }: Props) {
  if (hours === undefined)
    return <span className="text-muted">No times yet</span>;
  if (hours === null) return <span className="muted">Closed today</span>;

  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);

  return (
    <div>
      <span className="tabular-nums">
        {hours.open} - {hours.close}
      </span>
      <div
        role="img"
        aria-label={`Open form ${hours.open} to ${hours.close}`}
        className="relative mt-2 h-1.5 w-60 bg-line"
      >
        <div
          className="absolute inset-y-0 bg-ink"
          style={{
            left: `${(open / 1440) * 100}%`,
            width: `${((close - open) / 1440) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
