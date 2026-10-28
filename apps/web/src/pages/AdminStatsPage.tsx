import { useState } from "react";
import { useStats } from "../queries/admin";

export default function AdminStatsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isFetching, isError, error } = useStats(from, to);

  return (
    <div>
      <h1 className="text-3xl font-bold">Stats</h1>

      <div className="mt-2 flex gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {isFetching && <p>Loading...</p>}
      {isError && <p className="text-red-600">{error.message}</p>}

      {data && (
        <ul className="mt-4">
          <li>New users: {data.newUsers}</li>
          <li>New businesses: {data.newBusinesses}</li>
          <li>Bookings: {data.bookings.count}</li>
          <li>Revenue: {(data.bookings.totalCents / 100).toFixed(2)} €</li>
        </ul>
      )}
    </div>
  );
}
