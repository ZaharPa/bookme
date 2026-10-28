import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { changeBusinessStatus, useAdminBusinesses } from "../queries/admin";
import type { BusinessStatus } from "../types/admin";
import Pagination from "../components/Pagination";

const FILTERS = ["PENDING", "APPROVED", "REJECTED"] as const;

export default function AdminBusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const status = searchParams.get("status") ?? "";
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, isPlaceholderData } =
    useAdminBusinesses(page, status);

  const {
    mutate: setStatus,
    isPending: isSetting,
    error: setError,
  } = useMutation({
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

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Businesses</h1>

      <select value={status} onChange={(e) => handleFilter(e.target.value)}>
        <option value="">All</option>
        {FILTERS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {data.items.length === 0 ? (
        <p className="mt-4">No businesses</p>
      ) : (
        <ul>
          {data.items.map((business) => (
            <li key={business.id} className="mt-2 grid grid-cols-5 gap-2">
              <div>{business.name}</div>
              <div>{business.email}</div>
              <div>{business.status}</div>
              <div className="col-span-2 flex gap-1">
                {business.status !== "APPROVED" && (
                  <button
                    onClick={() =>
                      setStatus({
                        businessId: business.id,
                        status: "APPROVED",
                      })
                    }
                    disabled={isSetting}
                    className="border p-2 cursor-pointer"
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
                    className="border p-2 cursor-pointer"
                  >
                    Reject
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {setError && <p className="text-red-600">{setError.message}</p>}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
