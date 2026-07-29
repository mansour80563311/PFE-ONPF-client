import api from "../api/axios";

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  User,
} from "../types/auth";

class AuthService {
  async login(
    data: LoginRequest
  ): Promise<LoginResponse> {
    const response =
      await api.post<LoginResponse>(
        "/auth/login",
        data
      );

    return response.data;
  }

  async me(): Promise<User> {
    const response =
      await api.get<MeResponse>(
        "/auth/me"
      );

    const currentUser =
      response.data.data;

    /*
     * Le backend retourne role sous forme
     * d’objet. Le frontend utilise uniquement
     * le nom du rôle.
     */
    return {
      id: currentUser.id,
      nom: currentUser.nom,
      prenom: currentUser.prenom,
      login: currentUser.login,
      role: currentUser.role.nom,
    };
  }
}

export default new AuthService();