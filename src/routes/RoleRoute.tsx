import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";

import type {
  Role,
} from "../utils/roles";

interface Props {
  roles: Role[];
}

function RoleRoute({
  roles,
}: Props) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  /*
   * ProtectedRoute gère déjà l’écran de
   * chargement, mais cette vérification
   * évite toute décision prématurée.
   */
  if (isLoading) {
    return null;
  }

  /*
   * L’utilisateur n’est pas connecté ou
   * sa session n’est plus valide.
   */
  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * Le rôle utilisé est celui récupéré
   * depuis /auth/me et conservé dans
   * AuthProvider, et non l’ancien rôle
   * enregistré dans localStorage.
   */
  if (
    !roles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;