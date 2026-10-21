import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export default function VerifyEmailBanner() {
  const { user } = useAuth();

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: () => api.post("/auth/send-verification"),
  });

  if (!user || user.emailVerifiedAt) return null;

  return (
    <div className="bg-yellow-100 p-2 text-center">
      Please verify your email
      {isError && <p className="mt-2 text-red-600">{error.message}</p>}
      <button
        onClick={() => mutate()}
        disabled={isPending || isSuccess}
        className="underline"
      >
        {isSuccess ? "Email sent" : "Send email"}
      </button>
    </div>
  );
}
