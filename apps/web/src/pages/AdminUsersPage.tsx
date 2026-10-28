import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { banUser, unbanUser, useAdminUsers } from "../queries/admin";
import Pagination from "../components/Pagination";

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, isPlaceholderData } =
    useAdminUsers(page);

  const {
    mutate: toggleBan,
    isPending: isToggling,
    error: toggleError,
  } = useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) =>
      banned ? unbanUser(userId) : banUser(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: String(newPage),
    });
  };

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p className="text-red-600">{error.message}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>

      {data.items.length === 0 ? (
        <p className="mt-4">No users</p>
      ) : (
        <ul>
          {data.items.map((user) => (
            <li key={user.id} className="mt-2 grid grid-cols-5 gap-2">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{user.role}</div>
              <div>{user.bannedAt ? "Banned" : "Active"}</div>
              {user.role !== "ADMIN" && (
                <button
                  onClick={() =>
                    toggleBan({ userId: user.id, banned: !!user.bannedAt })
                  }
                  disabled={isToggling}
                  className="border p-2 cursor-pointer"
                >
                  {user.bannedAt ? "Unban" : "Ban"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {toggleError && <p className="text-red-600">{toggleError.message}</p>}

      <Pagination
        page={page}
        totalPages={data.totalPages}
        isLoading={isPlaceholderData}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
