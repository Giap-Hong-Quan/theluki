import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id?: string;
  role?: string;
  date?: string;
}
interface RequireAuthProps {
  allowedRoles?: string[];
}
const RequireAuth: React.FC<RequireAuthProps> = ({
  allowedRoles = ["admin", "staff"],
}) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const userRole = decoded?.role || "";

    if (!allowedRoles.includes(userRole)) {
      localStorage.removeItem("accessToken");
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;