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

  const { mutate: toggleBan, isPending: isToggling } = useMutation({
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

  if (isPending) return <p className="muted">Loading...</p>;
  if (isError)
    return (
      <p role="alert" className="field-error">
        {error.message}
      </p>
    );

  return (
    <div>
      <h1>Users</h1>
      <p className="muted mt-1">A banned user cannot log in or use the site.</p>

      {data.items.length === 0 ? (
        <p className="muted mt-4">No users yet</p>
      ) : (
        <div className="table-wrap mt-6">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="text-muted">{user.role}</td>
                  <td
                    className={
                      user.bannedAt ? "font-semibold text-busy" : "text-muted"
                    }
                  >
                    {user.bannedAt ? "Banned" : "Active"}
                  </td>
                  <td className="text-right">
                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() =>
                          toggleBan({
                            userId: user.id,
                            banned: !!user.bannedAt,
                          })
                        }
                        disabled={isToggling}
                        className={
                          user.bannedAt ? "btn-secondary" : "btn-danger"
                        }
                      >
                        {user.bannedAt ? "Unban" : "Ban"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
