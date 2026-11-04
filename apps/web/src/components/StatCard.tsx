type Props = {
  title: string;
  total: string;
  points: { label: string; value: number }[];
  format?: (value: number) => string;
};

export default function StatCard({
  title,
  total,
  points,
  format = String,
}: Props) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const summary = points
    .map((p) => `${p.label} : ${format(p.value)}`)
    .join(", ");

  return (
    <figure className="panel">
      <figcaption className="muted">{title}</figcaption>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{total}</p>

      <div
        role="img"
        aria-label={`${title}. ${summary}`}
        className="mt-4 flex h-24 items-end gap-1.5 border-b border-line"
      >
        {points.map((p) => (
          <div
            key={p.label}
            title={`${p.label} : ${format(p.value)}`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className="w-full bg-brand"
              style={{
                height: `${p.value > 0 ? Math.max((p.value / max) * 100, 3) : 0}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs tabular-nums text-muted">
        <span>{points[0]?.label}</span>
        {points.length > 1 && <span>{points[points.length - 1]?.label}</span>}
      </div>
    </figure>
  );
}
