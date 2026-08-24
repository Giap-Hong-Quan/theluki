import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth: React.FC = () => {
  const token =
    localStorage.getItem("admin_token") || localStorage.getItem("astkn");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;