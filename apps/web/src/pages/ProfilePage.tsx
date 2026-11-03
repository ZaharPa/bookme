import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { type ChangePassword, ChangePasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../queries/password";
import { toast } from "sonner";
import VerifyEmailBanner from "../components/VerifyEmailBanner";
import Field from "../components/Field";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePassword>({ resolver: zodResolver(ChangePasswordSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      toast.success("Password changed");
      try {
        await logout();
      } finally {
        navigate("/login");
      }
    },
  });

  return (
    <div className="max-w-lg">
      <h1>Profile</h1>

      <dl className="sheet mt-6">
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">Name</dt>
          <dd>{user?.name}</dd>
        </div>
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div className="sheet-row flex justify-between gap-4 py-3">
          <dt className="text-muted">Email status</dt>
          <dd>{user?.emailVerifiedAt ? "Verified" : "Not verified"}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <VerifyEmailBanner />
      </div>

      <h2 className="mt-10">Change password</h2>
      <p className="muted mt-1">
        You will be logged out and need to log in with the new password.
      </p>

      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="mt-4 space-y-5"
      >
        <Field
          label="Current password"
          error={errors.oldPassword?.message ?? ""}
        >
          <input
            type="password"
            autoComplete="current-password"
            {...register("oldPassword")}
          />
        </Field>
        <Field
          label="New password"
          hint="At least 8 characters with one capital an one number"
          error={errors.newPassword?.message ?? ""}
        >
          <input
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>

        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
