import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";

import UserListPage from "../pages/users/UserListPage";
import CreateUserPage from "../pages/users/CreateUserPage";
import UpdateUserPage from "../pages/users/UpdateUserPage";

import DemandeListPage from "../pages/demandes/DemandeListPage";
import CreateDemandePage from "../pages/demandes/CreateDemandePage";
import UpdateDemandePage from "../pages/demandes/UpdateDemandePage";
import ViewDemandePage from "../pages/demandes/ViewDemandePage";

import JournalClotureListPage from "../pages/journaux-cloture/JournalClotureListPage";
import CreateJournalCloturePage from "../pages/journaux-cloture/CreateJournalCloturePage";
import ViewJournalCloturePage from "../pages/journaux-cloture/ViewJournalCloturePage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import MainLayout from "../layouts/MainLayout";

import {
  ROLES,
} from "../utils/roles";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}

        <Route
          path="/"
          element={<LoginPage />}
        />

        {/* Routes nécessitant une connexion */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Accessible aux trois rôles */}

            <Route
              element={
                <RoleRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.AGENT,
                    ROLES.RESPONSABLE,
                  ]}
                />
              }
            >
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/demandes"
                element={<DemandeListPage />}
              />

              <Route
                path="/demandes/:id"
                element={<ViewDemandePage />}
              />
            </Route>

            {/* Création et modification :
                Administrateur et Agent */}

            <Route
              element={
                <RoleRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.AGENT,
                  ]}
                />
              }
            >
              <Route
                path="/demandes/create"
                element={
                  <CreateDemandePage />
                }
              />

              <Route
                path="/demandes/edit/:id"
                element={
                  <UpdateDemandePage />
                }
              />
            </Route>

            {/* Gestion des utilisateurs :
                Administrateur uniquement */}

            <Route
              element={
                <RoleRoute
                  roles={[ROLES.ADMIN]}
                />
              }
            >
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
            </Route>

            {/* Journaux de clôture :
                Administrateur et Responsable */}

            <Route
              element={
                <RoleRoute
                  roles={[
                    ROLES.ADMIN,
                    ROLES.RESPONSABLE,
                  ]}
                />
              }
            >
              <Route
                path="/journaux-cloture"
                element={
                  <JournalClotureListPage />
                }
              />

              <Route
                path="/journaux-cloture/create"
                element={
                  <CreateJournalCloturePage />
                }
              />

              <Route
                path="/journaux-cloture/:id"
                element={
                  <ViewJournalCloturePage />
                }
              />
            </Route>
          </Route>
        </Route>

        {/* Route inconnue */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;