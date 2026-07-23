import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UserListPage from "../pages/users/UserListPage";
import CreateUserPage from "../pages/users/CreateUserPage";
import UpdateUserPage from "../pages/users/UpdateUserPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import MainLayout from "../layouts/MainLayout";
import { ROLES } from "../utils/roles";

import DemandeListPage from "../pages/demandes/DemandeListPage";
import CreateDemandePage from "../pages/demandes/CreateDemandePage";
import UpdateDemandePage from "../pages/demandes/UpdateDemandePage";

import ViewDemandePage from "../pages/demandes/ViewDemandePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Route publique */}
        <Route path="/" element={<LoginPage />} />

        {/* Toutes les routes nécessitent une connexion */}
        <Route element={<ProtectedRoute />}>

          {/* Layout commun */}
          <Route element={<MainLayout />}>

            {/* Accessible à tous les utilisateurs connectés */}
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Accessible uniquement aux administrateurs */}
            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route
                path="/users"
                element={<UserListPage />}
              />
              <Route
                path="/users/create"
                element={<CreateUserPage />}
              />
              <Route
                path="/users/edit/:id"
                element={<UpdateUserPage />}
              />
              <Route
                path="/demandes"
                element={<DemandeListPage />}
              />
              <Route
                path="/demandes/create"
                element={<CreateDemandePage />}
              />
              <Route
                path="/demandes/edit/:id"
                element={<UpdateDemandePage />}
              />
              <Route
                path="/demandes/:id"
                element={<ViewDemandePage />}
              />
            </Route>

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;