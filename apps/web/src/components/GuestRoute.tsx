import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router";

export default function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading...</p>;

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/";

  if (user) return <Navigate to={from} replace />;

  return <Outlet />;
}
