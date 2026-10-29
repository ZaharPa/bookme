import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { type ResetPassword, ResetPasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../queries/password";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (values: ResetPassword) =>
      resetPassword(token!, values.newPassword),
  });

  if (!token) return <p>Invalid reset link</p>;

  if (isSuccess) {
    return (
      <div>
        <p>Password changed</p>
        <Link to="/login" className="underline">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">New password</h1>
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="mt-4 space-y-3"
      >
        <div>
          <input
            type="password"
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
          {isPending ? "Saving..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
