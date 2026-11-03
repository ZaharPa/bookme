import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ApiError, fieldError } from "../lib/error";
import { useForm } from "react-hook-form";
import { type LoginForm, loginSchema } from "../schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "../components/Field";

export default function LoginPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginForm) {
    try {
      await login(values.email, values.password);
    } catch (err) {
      if (err instanceof ApiError) {
        const emailIssue = fieldError(err.details, "email");
        const passowordIssue = fieldError(err.details, "password");

        if (emailIssue) setError("email", { message: emailIssue });
        if (passowordIssue) setError("password", { message: passowordIssue });

        if (!emailIssue && !passowordIssue)
          setError("root", { message: err.message });
      } else {
        setError("root", { message: "Something went wrong" });
      }
    }
  }

  return (
    <div className="max-w-sm">
      <h1>Log in</h1>

      <form
        noValidate
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="mt-6 space-y-5"
      >
        <Field label="Email" error={errors.email?.message ?? ""}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" error={errors.password?.message ?? ""}>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
        </Field>

        {errors.root && (
          <p role="alert" className="field-error">
            {errors.root.message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting} className="btn w-full">
          {isSubmitting ? "Logging in ..." : "Log in"}
        </button>
      </form>

      <p className="mt-6">
        <Link to="/register" className="link">
          Don't have an account? Register
        </Link>
      </p>

      <p className="mt-2">
        <span className="muted">No account yet?</span>
        <Link to="/forget-password" className="link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
