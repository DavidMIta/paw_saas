import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="page-loader">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<string, string> = {
      client: "/client",
      staff: "/staff",
      owner: "/",
      super_admin: "/",
    };
    return <Navigate to={roleRedirects[user.role] || "/"} replace />;
  }

  return <>{children}</>;
}
