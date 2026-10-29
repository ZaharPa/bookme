import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { type ChangePassword, ChangePasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../queries/password";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePassword>({ resolver: zodResolver(ChangePasswordSchema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      try {
        await logout();
      } finally {
        navigate("/login");
      }
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <p>Email verified: {user?.emailVerifiedAt ? "yes" : "no"}</p>

      <h2 className="text-xl mt-6 font-semibold">Change password</h2>
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="mt-2 space-y-3"
      >
        <div>
          <input
            type="passoword"
            autoComplete="current-password"
            placeholder="Current password"
            {...register("oldPassword")}
          />
          {errors.oldPassword && (
            <p className="text-red-600">{errors.oldPassword.message}</p>
          )}
        </div>
        <div>
          <input
            type="passoword"
            autoComplete="new-password"
            placeholder="New password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-red-600">{errors.newPassword.message}</p>
          )}
        </div>
        {error && <p className="text-red-600">{error.message}</p>}
        <button type="submit" disabled={isPending} className="border p-2">
          {isPending ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
