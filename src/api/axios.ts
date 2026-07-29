import axios from "axios";

import authStore from "../store/auth.store";

interface ApiErrorResponse {
  message?: string;
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token =
      authStore.getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    const message =
      responseData?.message;

    const requestUrl =
      error.config?.url ?? "";

    /*
     * Une erreur de connexion ne doit pas
     * provoquer une redirection automatique.
     *
     * Elle doit simplement être affichée
     * dans le formulaire de connexion.
     */
    const isLoginRequest =
      requestUrl.includes(
        "/auth/login"
      );

    /*
     * Déconnexion dans les cas suivants :
     *
     * - token expiré ou invalide ;
     * - utilisateur supprimé ;
     * - utilisateur désactivé.
     *
     * Un simple 403 "Accès refusé" ne
     * déconnecte pas l’utilisateur.
     */
    const mustLogout =
      (
        status === 401 &&
        !isLoginRequest
      ) ||
      (
        status === 403 &&
        message ===
          "Utilisateur désactivé."
      );

    if (mustLogout) {
      authStore.logout();

      /*
       * Le rechargement permet aussi de
       * réinitialiser complètement l’état
       * du AuthProvider.
       */
      if (
        window.location.pathname !==
        "/"
      ) {
        window.location.replace(
          "/"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;