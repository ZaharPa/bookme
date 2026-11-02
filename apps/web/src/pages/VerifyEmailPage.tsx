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

  if (!token)
    return (
      <div className="max-w-lg">
        <h1>This link does not work</h1>
        <p className="mt-2 text-muted">
          The verification link is incomplete. You can ask for a new one in your
          profile.
        </p>
        <Link to="/profile" className="btn mt-6">
          Go to profile
        </Link>
      </div>
    );

  if (isSuccess) {
    return (
      <div className="panel max-w-lg" role="status">
        <h1>Email verified</h1>
        <p className="mt-2 text-muted">
          Now you can add your business and start taking bookings.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/businesses/create" className="btn">
            Add your business
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1>Verify your email</h1>
      <p className="mt-2 text-muted">
        Press the button to confirm that this address is yours.
      </p>

      {isError && (
        <p className="field-error mt-4" role="alert">
          {error.message}. The link may have expired: you can request a new one
          in your
          <Link to="/profile" className="link">
            profile
          </Link>
        </p>
      )}

      <button
        onClick={() => mutate(token)}
        disabled={isPending}
        className="btn mt-6"
      >
        {isPending ? "Verifying..." : "Confirm email"}
      </button>
    </div>
  );
}
