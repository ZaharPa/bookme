import { useBusinesses } from "../queries/business";
import type { Business } from "../types/Business";
import Pagination from "../components/Pagination";
import { Link, useSearchParams } from "react-router";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const { data, isPending, isError, error, isPlaceholderData } =
    useBusinesses(page);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Book something</h1>
      <p className="mt-2 text-gray-600">Text under</p>

      {data.items.length === 0 ? (
        <p className="mt-4">No businesses yet</p>
      ) : (
        <ul>
          {data.items.map((business: Business) => (
            <li key={business.id}>
              <Link
                to={`/businesses/${business.id}`}
                className="grid  grid-cols-3 gap-2 text-center mt-4"
              >
                <div>{business.name}</div>
                <div>{business.phone}</div>
                <div>{business.description}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      ></Pagination>
    </div>
  );
}
