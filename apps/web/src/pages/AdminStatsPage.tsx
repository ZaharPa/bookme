import { useState } from "react";
import { useStats } from "../queries/admin";
import { formatPrice } from "../utils/format";
import StatCard from "../components/StatCard";

const dayLabel = new Intl.DateTimeFormat("en-IE", {
  day: "numeric",
  month: "short",
});

export default function AdminStatsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isFetching, isError, error } = useStats(from, to);

  const label = (date: string) => dayLabel.format(new Date(`${date}T00:00`));

  return (
    <div>
      <h1>Stats</h1>
      <p className="muted mt-1">
        Numbers for the chosen days, including the last day
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <label>
          <span className="label">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          <span className="label">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>

      {(!from || !to) && (
        <p className="muted mt-6">Choose both dates to see the numbers</p>
      )}
      {isFetching && (
        <p role="status" className="muted mt-6">
          Loading...
        </p>
      )}
      {isError && (
        <p role="alert" className="field-error mt-6">
          {error.message}
        </p>
      )}

      {data && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StatCard
            title="New users"
            total={String(data.newUsers)}
            points={data.daily.map((d) => ({
              label: label(d.date),
              value: d.newUsers,
            }))}
          />
          <StatCard
            title="New businesses"
            total={String(data.newBusinesses)}
            points={data.daily.map((d) => ({
              label: label(d.date),
              value: d.newBusinesses,
            }))}
          />
          <StatCard
            title="Bookings"
            total={String(data.bookings.count)}
            points={data.daily.map((d) => ({
              label: label(d.date),
              value: d.bookings,
            }))}
          />
          <StatCard
            title="Revenue"
            total={formatPrice(data.bookings.totalCents)}
            format={formatPrice}
            points={data.daily.map((d) => ({
              label: label(d.date),
              value: d.revenueCents,
            }))}
          />
        </div>
      )}
    </div>
  );
}
