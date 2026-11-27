import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600" role="status">
      <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {label}
    </div>
  );
}

/** Only logged-in users get through; everyone else goes to /login and comes back afterwards. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageLoader label="Checking your session..." />;
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Login/register pages: logged-in users are sent straight to their feed. */
export function GuestRoute() {
  const { status } = useAuth();
  if (status === "loading") return <PageLoader />;
  if (status === "authenticated") return <Navigate to="/feed" replace />;
  return <Outlet />;
}
