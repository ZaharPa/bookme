import { Link, useSearchParams } from "react-router";
import Pagination from "../components/Pagination";
import { deleteBusiness, useMyBusinesses } from "../queries/business";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function MyBusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const queryClient = useQueryClient();

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const { data, isPending, isError, error, isPlaceholderData } =
    useMyBusinesses(page);

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["businesses"] }),
  });

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">My businesses</h1>
      <p className="mt-2 text-gray-600">Text under</p>

      <Link
        to="/businesses/create"
        className="underline border border-gray-300"
      >
        Create new business
      </Link>

      {data.items.length === 0 ? (
        <p className="mt-4">No businesses yet</p>
      ) : (
        <ul>
          {data.items.map((business) => (
            <li key={business.id} className=" mt-4">
              <div className="grid grid-cols-5 gap-2 text-center">
                {" "}
                <Link
                  to={`/businesses/${business.id}`}
                  className="col-span-3 grid grid-cols-3 gap-2 "
                >
                  <div>{business.name}</div>
                  <div>{business.phone}</div>
                  <div>{business.description}</div>
                </Link>
                <Link
                  to={`/businesses/${business.id}/update`}
                  className="border border-gray-400 p-2 cursor-pointer"
                >
                  Update
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this business?"))
                      remove(business.id);
                  }}
                  disabled={isDeleting}
                  className="border border-gray-400 p-2 cursor-pointer"
                >
                  Delete
                </button>
              </div>

              <ul className="ml-6 mt-2">
                {business.locations.map((location) => (
                  <li key={location.id} className="mt-2">
                    <div className="flex gap-2">
                      <span>
                        {location.city} {location.country} {location.address}
                      </span>
                      <Link
                        to={`/businesses/${business.id}/locations/${location.id}/update`}
                        className="border border-gray-400 p-2 cursor-pointer"
                      >
                        Update
                      </Link>
                    </div>

                    <ul className="ml-6">
                      {location.resources.map((resource) => (
                        <li key={resource.id} className="flex gap-2">
                          <span>
                            {resource.name}{" "}
                            {(resource.priceCents / 100).toFixed(2)} $
                          </span>
                          <Link
                            to={`/businesses/${business.id}/locations/${location.id}/resources/${resource.id}/update`}
                            className="border border-gray-400 p-2 cursor-pointer"
                          >
                            Update
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/businesses/${business.id}/locations/${location.id}/resources/create`}
                      className="ml-6 mt-1 inline-block border border-gray-400 p-2"
                    >
                      Add resource
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`/businesses/${business.id}/locations/create`}
                className="ml-6 mt-2 inline-block border border-gray-400 p-2"
              >
                Add location
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
