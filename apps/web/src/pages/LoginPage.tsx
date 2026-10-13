import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmiting, setIsSubmiting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmiting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="mx-auto flex max-w-sm flex-col gap-3"
    >
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border p-2"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border p-2"
      />

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmiting}
        className="rounded bg-gray-900 p-2 text-white disabled:opacity-50"
      >
        {isSubmiting ? "Logging in ..." : "Login"}
      </button>
    </form>
  );
}
