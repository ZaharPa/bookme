import { Link, useSearchParams } from "react-router";
import Pagination from "../components/Pagination";
import { deleteBusiness, useMyBusinesses } from "../queries/business";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice, humanize } from "../utils/format";

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

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>My businesses</h1>
        <Link to="/businesses/create" className="btn">
          Addbusiness
        </Link>
      </div>

      {data.items.length === 0 ? (
        <p className="mt-4 muted">
          {" "}
          You have no businesses yet. Add one to start taking bookings
        </p>
      ) : (
        <ul className="mt-6 space-y-10">
          {data.items.map((business) => (
            <li key={business.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-3">
                <div>
                  <Link
                    to={`/businesses/${business.id}`}
                    className="link text-xl font-semibold"
                  >
                    {business.name}
                  </Link>
                  <p className="muted">
                    {humanize(business.type)}, {humanize(business.status)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/businesses/${business.id}/update`}>Edit</Link>
                </div>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this business with all its locations and resources?",
                      )
                    )
                      remove(business.id);
                  }}
                  disabled={isDeleting}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>

              {business.locations.map((location) => (
                <section key={location.id} className="mt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-base">
                      {location.address}, {location.city}
                    </h2>
                    <Link
                      to={`/businesses/${business.id}/locations/${location.id}/update`}
                      aria-label={`Edit location ${location.address}`}
                      className="link"
                    >
                      Edit location
                    </Link>
                  </div>

                  <ul className="sheet mt-2">
                    {location.resources.map((resource) => (
                      <li
                        key={resource.id}
                        className="sheet-row flex items-baseline justify-between gap-4 py-3"
                      >
                        <span>
                          <span className="font-semibold">{resource.name}</span>
                          <span className="tabular-nums text-muted">
                            {formatPrice(resource.priceCents)} per hour
                          </span>
                        </span>
                        <Link
                          to={`/businesses/${business.id}/locations/${location.id}/resources/${resource.id}/update`}
                          aria-label={`Edit ${resource.name}`}
                          className="link"
                        >
                          Edit
                        </Link>
                      </li>
                    ))}
                    <li className="sheet-row py-3">
                      <Link
                        to={`/businesses/${business.id}/locations/${location.id}/resources/create`}
                        className="link"
                      >
                        Add resource
                      </Link>
                    </li>
                  </ul>
                </section>
              ))}

              <Link
                to={`/businesses/${business.id}/locations/create`}
                className="
                link mt-6 inline-block"
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
      />
    </div>
  );
}
