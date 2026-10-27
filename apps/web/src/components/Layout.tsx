import { Link, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import VerifyEmailBanner from "./VerifyEmailBanner";

export default function Layout() {
  const { user, isLoading, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            Bookme
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <span>...</span>
            ) : user ? (
              <>
                {(user.role === "ADMIN" || user.role === "BUSINESS_OWNER") && (
                  <Link
                    to="/businesses/mine"
                    className="underline border border-gray-300"
                  >
                    My businesses
                  </Link>
                )}
                <Link
                  to="/bookings/mine"
                  className="underline border border-gray-300"
                >
                  My bookings
                </Link>
                <span>{user.name}</span>
                <button onClick={() => void logout()} className="underline">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="underline">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <VerifyEmailBanner />
        <Outlet />
      </main>
    </div>
  );
}
