import { Navigate, Outlet } from "react-router-dom";
import authStore from "../store/auth.store";

function ProtectedRoute() {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;