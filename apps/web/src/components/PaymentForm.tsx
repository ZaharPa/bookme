import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState, type FormEvent } from "react";

export default function PaymentForm({ onPaid }: { onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPending(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setIsPending(false);
    } else {
      onPaid();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || isPending}
        className="mt-2 border p-2"
      >
        {isPending ? "Paying..." : "Pay"}
      </button>
    </form>
  );
}
