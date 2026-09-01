import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { auth } = useAuth();
  const token = localStorage.getItem("token") || auth?.token;
  const role = (localStorage.getItem("role") || auth?.role || "").toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
