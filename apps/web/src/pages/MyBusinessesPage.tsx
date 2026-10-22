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
            <li
              key={business.id}
              className="grid grid-cols-5 gap-2 text-center mt-4"
            >
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
