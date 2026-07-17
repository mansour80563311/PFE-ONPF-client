import api from "../api/axios";
import type { LoginRequest, LoginResponse } from "../types/auth";

class AuthService {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      data
    );

    return response.data;
  }

  async me() {
    const response = await api.get("/auth/me");
    return response.data;
  }
}

export default new AuthService();