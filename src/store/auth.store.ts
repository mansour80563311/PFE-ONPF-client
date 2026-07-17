import type { User } from "../types/auth";

class AuthStore {
  save(token: string, user: User) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  getToken() {
    return localStorage.getItem("token");
  }

  getUser(): User | null {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthStore();