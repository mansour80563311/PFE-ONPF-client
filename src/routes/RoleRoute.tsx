import { Navigate, Outlet } from "react-router-dom";

import authStore from "../store/auth.store";

interface Props {
  roles: string[];
}

function RoleRoute({ roles }: Props) {
  const user = authStore.getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;