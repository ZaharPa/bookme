import { useState } from "react";
import { useBusinesses } from "../queries/business";
import type { Business } from "../types/Business";
import Pagination from "../components/Pagination";

export default function HomePage() {
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, isPlaceholderData } =
    useBusinesses(page);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Book something</h1>
      <p className="mt-2 text-gray-600">Text under</p>

      <ul>
        {data.items.map((business: Business) => (
          <li
            key={business.id}
            className="grid  grid-cols-3 gap-2 text-center mt-4"
          >
            <div>{business.name}</div>
            <div>{business.phone}</div>
            <div>{business.description}</div>
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={setPage}
      ></Pagination>
    </div>
  );
}
