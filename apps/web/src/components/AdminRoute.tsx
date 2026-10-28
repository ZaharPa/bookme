import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (user?.role !== "ADMIN") <Navigate to="/" replace />;

  return <Outlet />;
}
