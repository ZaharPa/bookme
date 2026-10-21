import { Link, useSearchParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, refreshUser } = useAuth();

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: (token: string) => api.post("/auth/verify-email", { token }),
    onSuccess: async () => {
      if (user) await refreshUser();
    },
  });

  if (!token) return <p>Invalid verificcation link</p>;

  if (isSuccess) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Email Verified</h1>
        <Link to="/" className="underline">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Verify your email</h1>
      {isError && <p className="mt-2 text-red-600">{error.message}</p>}
      <button
        onClick={() => mutate(token)}
        disabled={isPending}
        className="mt-4 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Verifying..." : "Confirm email"}
      </button>
    </div>
  );
}
