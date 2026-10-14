import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
