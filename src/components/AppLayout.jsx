import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useBrowserAlerts from "../hooks/useBrowserAlerts";

const navClass = ({ isActive }) =>
  `rounded-[10px] px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-soft text-brand-ink" : "text-gray-700 hover:bg-gray-100"
  }`;

function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menu = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "mousedown" && menu.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.info("You have been logged out.");
    navigate("/login", { replace: true });
  };

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menu}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name} (${user.email})`}
        className="flex min-h-11 max-w-64 items-center gap-2 rounded-[10px] border border-gray-300 bg-white py-1 pl-1 pr-3 text-left transition hover:bg-gray-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          {initial}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-slate-900">{user.name}</span>
          <span className="block truncate text-xs text-gray-600" title={user.email}>
            {user.email}
          </span>
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <div className="border-b border-gray-100 px-3 pb-2 pt-1">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="break-all text-xs text-gray-600">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            to="/settings/password"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2 text-sm text-slate-800 hover:bg-gray-100"
          >
            Change password
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

/** Header + page content for every logged-in page. */
export default function AppLayout() {
  const { user } = useAuth();
  const toast = useToast();

  useBrowserAlerts(user, (items) =>
    toast.info(`${items.length} new ${items.length === 1 ? "alert" : "alerts"} just arrived.`),
  );

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-280 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-8">
          <div className="flex items-center gap-6">
            <Link to="/feed" className="font-serif text-[22px] font-semibold tracking-tight text-slate-900">
              Real-Time News Alerts
            </Link>
            <nav className="flex items-center gap-1" aria-label="Main">
              <NavLink to="/feed" className={navClass}>
                News Feed
              </NavLink>
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
