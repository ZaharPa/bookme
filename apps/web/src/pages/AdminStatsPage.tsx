import { useState } from "react";
import { useStats } from "../queries/admin";
import { formatPrice } from "../utils/format";

export default function AdminStatsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isFetching, isError, error } = useStats(from, to);

  return (
    <div>
      <h1>Stats</h1>
      <p className="muted mt-1">
        Numbers for the chosen days, including the last day
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <label>
          <span className="mb-1 block text-sm font-semibold">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">To</span>
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
        <dl className="sheet mt-6 max-w-lg">
          <div className="sheet-row flex items-baseline justify-between">
            <dt>New users</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {data.newUsers}
            </dd>
          </div>
          <div className="sheet-row flex items-baseline justify-between">
            <dt>New businesses</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {data.newBusinesses}
            </dd>
          </div>
          <div className="sheet-row flex items-baseline justify-between">
            <dt>Bookings</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {data.bookings.count}
            </dd>
          </div>
          <div className="sheet-row flex items-baseline justify-between">
            <dt>Revenue</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {formatPrice(data.bookings.totalCents)}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
