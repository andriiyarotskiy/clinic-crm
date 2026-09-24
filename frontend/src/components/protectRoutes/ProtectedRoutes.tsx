import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/store/hook";
import type { UserRole } from "@/types/userRole";


type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
};

export const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth.isInitialized) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!auth.user) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(auth.user.role)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};