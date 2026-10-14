import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ApiError, fieldError } from "../lib/error";
import { useForm } from "react-hook-form";
import { type RegistrationForm, registrationSchema } from "../schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RegistrationPage() {
  const { registration } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  async function onSubmit(values: RegistrationForm) {
    try {
      await registration(values.name, values.email, values.password);
    } catch (err) {
      if (err instanceof ApiError) {
        const nameIssue = fieldError(err.details, "name");
        const emailIssue = fieldError(err.details, "email");
        const passowordIssue = fieldError(err.details, "password");

        if (nameIssue) setError("name", { message: nameIssue });
        if (emailIssue) setError("email", { message: emailIssue });
        if (passowordIssue) setError("password", { message: passowordIssue });

        if (!nameIssue && !emailIssue && !passowordIssue)
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
      <h1 className="text-2xl font-bold">Registration</h1>

      <input
        type="text"
        placeholder="Your name"
        {...register("name")}
        autoComplete="name"
        className="rounded border p-2"
      />
      {errors.name && <p className="text-red-600">{errors.name.message}</p>}

      <input
        type="email"
        placeholder="Email"
        {...register("email")}
        autoComplete="email"
        className="rounded border p-2"
      />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        {...register("password")}
        autoComplete="new-password"
        className="rounded border p-2"
      />
      {errors.password && (
        <p className="text-red-600">{errors.password.message}</p>
      )}

      <input
        type="password"
        placeholder="Confirm password"
        {...register("confirmPassword")}
        autoComplete="new-password"
        className="rounded border p-2"
      />
      {errors.confirmPassword && (
        <p className="text-red-600">{errors.confirmPassword.message}</p>
      )}

      {errors.root && <p className="text-red-600">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-gray-900 p-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Register in ..." : "Register"}
      </button>

      <Link to="/login" className="pt-4 text-sm underline text-gray-500">
        Already have an account? Log in
      </Link>
    </form>
  );
}
