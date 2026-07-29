import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  useAuth,
} from "../hooks/useAuth";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  /*
   * Pendant la vérification de /auth/me,
   * aucune décision de redirection ne doit
   * encore être prise.
   */
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={36}
        />
      </Box>
    );
  }

  /*
   * Après vérification, un utilisateur sans
   * session valide est redirigé vers la page
   * de connexion.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;