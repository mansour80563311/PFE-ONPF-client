import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  User,
} from "../types/auth";

import authService from "../services/auth.service";

import authStore from "../store/auth.store";

import {
  AuthContext,
} from "./auth.context";

interface Props {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: Props) {
  /*
   * L’utilisateur enregistré dans
   * localStorage peut avoir un ancien rôle.
   *
   * Il sera donc récupéré depuis le backend
   * avec la route /auth/me.
   */
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    token,
    setToken,
  ] = useState<string | null>(
    authStore.getToken()
  );

  /*
   * Empêche les routes protégées de prendre
   * une décision avant la vérification du
   * token enregistré.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const login = (
    newToken: string,
    authenticatedUser: User
  ) => {
    authStore.save(
      newToken,
      authenticatedUser
    );

    setToken(newToken);
    setUser(authenticatedUser);
    setIsLoading(false);
  };

  const logout = () => {
    authStore.logout();

    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const verifyCurrentSession =
      async () => {
        const storedToken =
          authStore.getToken();

        /*
         * Aucun token n’est enregistré.
         */
        if (!storedToken) {
          setUser(null);
          setToken(null);
          setIsLoading(false);

          return;
        }

        try {
          /*
           * Le backend vérifie :
           *
           * - l’existence de l’utilisateur ;
           * - son statut actuel ;
           * - son rôle actuel dans la base.
           */
          const currentUser =
            await authService.me();

          /*
           * Actualisation du rôle et des
           * informations dans localStorage.
           */
          authStore.save(
            storedToken,
            currentUser
          );

          setToken(storedToken);
          setUser(currentUser);
        } catch (sessionError) {
          console.error(
            "Session invalide :",
            sessionError
          );

          /*
           * Token expiré, utilisateur supprimé
           * ou compte désactivé.
           */
          authStore.logout();

          setToken(null);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

    void verifyCurrentSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,

        isAuthenticated:
          Boolean(
            token &&
            user
          ),

        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}