import { useBusinesses } from "../queries/business";
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
          {data.items.map((business) => (
            <li key={business.id} className=" mt-4">
              <div className="grid grid-cols-5 gap-2 text-center">
                <Link
                  to={`/businesses/${business.id}`}
                  className="col-span-3 grid grid-cols-3 gap-2 "
                >
                  <div>{business.name}</div>
                  <div>{business.phone}</div>
                  <div>{business.description}</div>
                </Link>
              </div>

              <ul className="ml-6 mt-2">
                {business.locations.map((location) => (
                  <li key={location.id} className="mt-2">
                    <div className="flex gap-2">
                      <span>
                        {location.city} {location.country} {location.address}
                      </span>
                    </div>

                    <ul className="ml-6">
                      {location.resources.map((resource) => (
                        <li key={resource.id} className="flex gap-2">
                          <span>
                            {resource.name}
                            {(resource.priceCents / 100).toFixed(2)} $
                          </span>
                          <Link
                            to={`/businesses/${business.id}/locations/${location.id}/resources/${resource.id}/book`}
                            className="cursor-pointer border p-1"
                          >
                            Book
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
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
