import { useForm } from "react-hook-form";
import { type ForgetPassword, ForgetPasswordSchema } from "../schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "../queries/password";

export default function ForgetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPassword>({ resolver: zodResolver(ForgetPasswordSchema) });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (values: ForgetPassword) => forgetPassword(values.email),
  });

  if (isSuccess) {
    return (
      <p>
        If an account with this enail exists, we sent a reser link. Check your
        email inbox.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Forget Password</h1>
      <form
        onSubmit={handleSubmit((v) => mutate(v))}
        className="mt-4 space-y-3"
      >
        <div>
          <input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-red-600">{errors.email.message}</p>
          )}
        </div>
        {error && <p className="text-red-600">{error.message}</p>}
        <button type="submit" disabled={isPending} className="border p-2">
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
