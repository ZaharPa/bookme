import { NavLink, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

type Tab = { to: string; label: string; roles?: string[] };

const TABS: Tab[] = [
  { to: "/bookings/mine", label: "My bookings" },
  { to: "/businesses/mine", label: "My business" },
  {
    to: "/businesses/bookings/mine",
    label: "Business bookings",
    roles: ["BUSINESS_OWNER", "ADMIN"],
  },
  { to: "/admin/businesses", label: "Admin businesses", roles: ["ADMIN"] },
  { to: "/admin/users", label: "Admin users", roles: ["ADMIN"] },
  { to: "/admin/stats", label: "Admin stats", roles: ["ADMIN"] },
  { to: "/profile", label: "Profile" },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const tabs = TABS.filter(
    (tab) => !tab.roles || tab.roles.includes(user.role),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 border-b border-line">
        <nav className="flex flex-wrap gap-x-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `-mb-px border-b-2 py-3 ${
                  isActive
                    ? "border-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => void logout} className="btn-secondary">
          Log out
        </button>
      </div>
      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}
