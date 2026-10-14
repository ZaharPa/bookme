import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ApiError, fieldError } from "../lib/error";
import { useForm } from "react-hook-form";
import { type LoginForm, loginSchema } from "../schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <form
      noValidate
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="mx-auto flex max-w-sm flex-col gap-3"
    >
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        type="email"
        placeholder="Email"
        {...register("email")}
        className="rounded border p-2"
      />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        {...register("password")}
        className="rounded border p-2"
      />
      {errors.password && (
        <p className="text-red-600">{errors.password.message}</p>
      )}

      {errors.root && <p className="text-red-600">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-gray-900 p-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Logging in ..." : "Login"}
      </button>

      <Link to="/register" className="pt-4 text-sm underline text-gray-500">
        Don't have an account? Register
      </Link>
    </form>
  );
}
