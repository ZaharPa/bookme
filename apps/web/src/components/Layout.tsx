import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";

export default function Layout() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

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
                {user.role === "ADMIN" ||
                  (user.role === "BUSINESS_OWNER" && (
                    <Link
                      to="/businesses/mine"
                      className="underline border border-gray-300"
                    >
                      Business Bookings
                    </Link>
                  ))}
                <Link
                  to="/bookings/mine"
                  className="underline border border-gray-300"
                >
                  My bookings
                </Link>

                {user.role === "ADMIN" && (
                  <>
                    <Link
                      to="/admin/businesses"
                      className="underline border border-gray-300"
                    >
                      Admin businesses
                    </Link>
                    <Link
                      to="/admin/users"
                      className="underline border border-gray-300"
                    >
                      Admin users
                    </Link>{" "}
                    <Link
                      to="/admin/stats"
                      className="underline border border-gray-300"
                    >
                      Admin stats
                    </Link>
                  </>
                )}
                <Link
                  to="/businesses/mine"
                  className="underline border border-gray-300"
                >
                  My businesses
                </Link>
                <Link to="/profile">{user.name}</Link>
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
        <ErrorBoundary
          resetKeys={[location.pathname]}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <p>Something went wrong</p>
              <pre>
                {error instanceof Error ? error.message : "Unknown error"}
              </pre>
              <button onClick={resetErrorBoundary} className="border p-2">
                Try again
              </button>
            </div>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </main>

      <Toaster richColors />
    </div>
  );
}
