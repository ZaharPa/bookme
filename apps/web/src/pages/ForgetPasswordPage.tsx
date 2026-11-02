import { useForm } from "react-hook-form";
import { type ForgetPassword, ForgetPasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "../queries/password";
import { Link } from "react-router";
import Field from "../components/Field";

export default function ForgetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPassword>({ resolver: zodResolver(ForgetPasswordSchema) });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (values: ForgetPassword) => forgetPassword(values.email),
  });

  if (isSuccess) {
    return (
      <div className="panel max-w-lg" role="status">
        <h1>Check your email</h1>
        <p className="mt-2 text-muted">
          If an account with this email exists, we sent a link to reset the
          password.
        </p>
        <Link to="/login" className="link mt-4 inline-block">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1>Forgot your password?</h1>
      <p className="muted mt-1">
        Enter your email and we will send you a link to choose a new one.
      </p>

      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        noValidate
        className="mt-4 space-y-3"
      >
        <Field label="Email" error={errors.email?.message || ""}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>

        <button type="submit" disabled={isPending} className="btn">
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6">
        <Link to="/login" className="link">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
