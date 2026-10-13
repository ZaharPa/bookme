import { Link, useLocation, useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () =>
    location.key !== "default" ? navigate(-1) : navigate("/");
  return (
    <div className="flex  flex-col items-center justify-between text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-2xl mt-2 text-gray-500">Page not found</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={goBack}
          className="rounded bg-gray-900 px-4 py-2 text-white cursor-pointer"
        >
          Go back
        </button>
        <Link to="/" className="rounded border px-4 py-2">
          Home
        </Link>
      </div>
    </div>
  );
}
