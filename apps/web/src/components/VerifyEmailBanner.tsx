import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export default function VerifyEmailBanner() {
  const { user } = useAuth();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => api.post("/auth/send-verification"),
  });

  if (!user || user.emailVerifiedAt) return null;

  return (
    <div className="max-w-lg border border-line bg-white p-6">
      <h2>Verify your email</h2>
      <p className="mt-1 text-muted">
        You need a verified email to create a business. We will set a link to{" "}
        {user.email}
      </p>

      {isSuccess ? (
        <p role="status" className="mt-4 font-semibold">
          Link sent. Check your inbox
        </p>
      ) : (
        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending}
          className="btn mt-4"
        >
          {isPending ? "Sending..." : "Send link"}
        </button>
      )}
    </div>
  );
}
