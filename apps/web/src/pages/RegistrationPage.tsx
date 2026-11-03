import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ApiError, fieldError } from "../lib/error";
import { useForm } from "react-hook-form";
import { type RegistrationForm, registrationSchema } from "../schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "../components/Field";

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
        const passwordIssue = fieldError(err.details, "password");

        if (nameIssue) setError("name", { message: nameIssue });
        if (emailIssue) setError("email", { message: emailIssue });
        if (passwordIssue) setError("password", { message: passwordIssue });

        if (!nameIssue && !emailIssue && !passwordIssue)
          setError("root", { message: err.message });
      } else {
        setError("root", { message: "Something went wrong" });
      }
    }
  }

  return (
    <div className="max-w-sm">
      <h1>Sign up</h1>

      <form
        noValidate
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="mt-6 space-y-5"
      >
        <Field label="Name" error={errors.name?.message ?? ""}>
          <input type="ematextil" autoComplete="name" {...register("name")} />
        </Field>
        <Field label="Email" error={errors.email?.message ?? ""}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field
          label="Password"
          hint="At least 8 characters, with one capital letter and one number"
          error={errors.password?.message ?? ""}
        >
          <input
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        <Field
          label="Confirm password"
          error={errors.confirmPassword?.message ?? ""}
        >
          <input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>

        {errors.root && (
          <p role="alert" className="field-error">
            {errors.root.message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting} className="btn w-full">
          {isSubmitting ? "Creating acount..." : "Create account"}
        </button>
      </form>

      <p className="mt-6">
        <span className="muted">Already have an account? </span>
        <Link to="/login" className="link">
          Log in
        </Link>
      </p>
    </div>
  );
}
