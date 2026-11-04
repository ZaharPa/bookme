import { Link, useSearchParams } from "react-router";
import { BUSINESS_TYPES } from "../schemas/business";
import { formatPrice, humanize } from "../utils/format";
import { useBusinesses } from "../queries/business";
import Pagination from "../components/Pagination";
import { hoursToday, lowerPriceCents } from "../utils/business";
import HoursBar from "../components/HouseBar";

const FILTERS: [string, string][] = [
  ["", "All"],
  ...BUSINESS_TYPES.map((t): [string, string] => [t, humanize(t)]),
];

export default function PlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const type = BUSINESS_TYPES.find((t) => t === searchParams.get("type")) ?? "";
  const sort = searchParams.get("sort") === "popular" ? "popular" : "new";

  const { data, isPending, isError, error, isPlaceholderData } = useBusinesses(
    page,
    type,
    10,
    sort,
  );

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams();
    if (type) next.set("type", type);
    if (sort !== "new") next.set("sort", sort);
    if (newPage > 1) next.set("page", String(newPage));
    setSearchParams(next);
  };

  const handleSort = (sort: string) => {
    const next = new URLSearchParams(searchParams);

    if (sort === "new") {
      next.delete("sort");
    } else {
      next.set("sort", sort);
    }

    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div>
      <h1>Places</h1>
      <p className="muted mt-1">
        The bar shows when each place is open today. Open a place to see which
        times are free.
      </p>

      <nav
        aria-label="Filter by type"
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
      >
        {FILTERS.map(([value, label]) => (
          <Link
            key={value}
            to={value ? `/places?type=${value}` : "/places"}
            aria-current={value === type ? "true" : undefined}
            className={
              value === type
                ? "font-semibold underline underline-offset-4"
                : "text-muted hover:text-ink"
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between">
        <span className="muted">Sort by</span>

        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          aria-label="Sort places"
        >
          <option value="new">Newest</option>
          <option value="popular">Most popular</option>
        </select>
      </div>
      {isPending && <p className="muted mt-6">Loading…</p>}
      {isError && (
        <p className="field-error mt-6" role="alert">
          {error.message}
        </p>
      )}

      {data &&
        (data.items.length === 0 ? (
          <p className="muted mt-6">No places match this filter</p>
        ) : (
          <>
            <div className="table-wrap mt-6">
              <table>
                <thead>
                  <tr>
                    <th>Place</th>
                    <th>Open today</th>
                    <th>Price</th>
                    <th>
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((business) => {
                    const city = business.locations[0]?.city;
                    const price = lowerPriceCents(business);
                    return (
                      <tr key={business.id}>
                        <td>
                          <Link
                            to={`/businesses/${business.id}`}
                            className="link font-semibold"
                          >
                            {business.name}
                          </Link>
                          <p className="muted">
                            {humanize(business.type)}
                            {city && `, ${city}`}
                          </p>
                        </td>
                        <td>
                          <HoursBar hours={hoursToday(business)} />
                        </td>
                        <td className="tabular-nums">
                          {price !== null ? `from ${formatPrice(price)}` : "—"}
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/businesses/${business.id}`}
                            className="btn-secondary"
                          >
                            See times
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={data.totalPages}
              isLoading={isPlaceholderData}
              onPageChange={handlePageChange}
            />
          </>
        ))}
    </div>
  );
}
