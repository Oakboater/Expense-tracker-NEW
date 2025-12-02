// components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { authApi } from "../api/client";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = authApi.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}