import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { type ResetPassword, ResetPasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../queries/password";
import Field from "../components/Field";

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

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (values: ResetPassword) =>
      resetPassword(token!, values.newPassword),
  });

  if (!token)
    return (
      <div className="max-w-lg">
        <h1>This link does not work</h1>
        <p className="mt-2 text-muted">
          The reset link is incomplete or has expired.
        </p>
        <Link to="/forget-password" className="btn mt-6">
          Request a new link
        </Link>
      </div>
    );

  if (isSuccess) {
    return (
      <div className="panel max-w-lg" role="status">
        <h1>Password changed</h1>
        <p className="mt-2 text-muted">
          You can now log in with the new password.
        </p>
        <Link to="/login" className="btn mt-4">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Choose a new password</h1>
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        noValidate
        className="mt-6 space-y-5"
      >
        <Field
          label="New password"
          hint="At least 8 characters, with one capital and one number"
          error={errors.newPassword?.message ?? ""}
        >
          <input
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>
        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Saving..." : "Change password"}
        </button>
      </form>

      <p className="mt-6">
        <Link to="/forget-password" className="link">
          Request a new link
        </Link>
      </p>
    </div>
  );
}
