import type { Role } from "../utils/roles";

export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  login: string;
  role: Role;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}