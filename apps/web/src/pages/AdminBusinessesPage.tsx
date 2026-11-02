import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { changeBusinessStatus, useAdminBusinesses } from "../queries/admin";
import type { BusinessStatus } from "../types/admin";
import Pagination from "../components/Pagination";
import { humanize } from "../utils/format";

const FILTERS = ["PENDING", "APPROVED", "REJECTED"] as const;

export default function AdminBusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const status = searchParams.get("status") ?? "";
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, isPlaceholderData } =
    useAdminBusinesses(page, status);

  const { mutate: setStatus, isPending: isSetting } = useMutation({
    mutationFn: ({
      businessId,
      status,
    }: {
      businessId: string;
      status: BusinessStatus;
    }) => changeBusinessStatus(businessId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });

  const handleFilter = (value: string) => {
    setSearchParams(value ? { status: value } : {});
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(
      status ? { status, page: String(newPage) } : { page: String(newPage) },
    );
  };

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p className="field-error" role="alert">
        {error.message}
      </p>
    );

  return (
    <div>
      <h1>Businesses</h1>
      <p className="muted mt-1">
        Apprrove or reject businesses before they appear on the site.
      </p>

      <label className="mt-6 block max-w-xs">
        <span className="mb-1 block text-sm font-semibold">Status</span>
        <select
          value={status}
          onChange={(e) => handleFilter(e.target.value)}
          className="w-full"
        >
          <option value="">All</option>
          {FILTERS.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
      </label>

      {data.items.length === 0 ? (
        <p className="text-muted mt-6">
          {status
            ? `No businesses with status - ${status}`
            : "No businesses yet"}
        </p>
      ) : (
        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
          </table>
          <tbody>
            {data.items.map((business) => (
              <tr key={business.id}>
                <td>
                  <Link
                    to={`/businesses/${business.id}`}
                    className="link font-semibold"
                  >
                    {business.name}
                  </Link>
                  <p className="muted">{humanize(business.type)}</p>
                </td>
                <td>{business.email}</td>
                <td
                  className={
                    business.status === "PENDING"
                      ? "font-semibold"
                      : "text-muted"
                  }
                >
                  {" "}
                  {humanize(business.status)}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {business.status !== "APPROVED" && (
                      <button
                        onClick={() =>
                          setStatus({
                            businessId: business.id,
                            status: "APPROVED",
                          })
                        }
                        disabled={isSetting}
                        className="btn"
                      >
                        Approve
                      </button>
                    )}
                    {business.status !== "REJECTED" && (
                      <button
                        onClick={() =>
                          setStatus({
                            businessId: business.id,
                            status: "REJECTED",
                          })
                        }
                        disabled={isSetting}
                        className="btn"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </div>
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
