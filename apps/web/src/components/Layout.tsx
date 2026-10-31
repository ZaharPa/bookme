import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `py-3 ${isActive ? "text-ink" : "text-muted hover:text-ink"}`;

export default function Layout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="link">
              Bookme
            </Link>
            <NavLink to="/places" className={navLink}>
              Places
            </NavLink>
          </div>

          {isLoading ? (
            <span>...</span>
          ) : user ? (
            <Link to="/bookings/mine" className="link">
              {user.name}
            </Link>
          ) : (
            <div>
              <Link to="/login" className="link">
                Login
              </Link>
              <Link to="/rester" className="link">
                Sing up
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <ErrorBoundary
          resetKeys={[location.pathname]}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <p className="font-semibold">Something went wrong</p>
              <pre className="mt-2 text-sm text-muted">
                {error instanceof Error ? error.message : "Unknown error"}
              </pre>
              <button onClick={resetErrorBoundary} className="btn">
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
