import type {
  Role,
} from "../utils/roles";

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

/*
 * Structure réellement retournée par
 * GET /auth/me.
 */
export interface MeApiUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  login: string;
  statut: boolean;
  roleId: string;
  createdAt: string;
  updatedAt: string;

  role: {
    id: string;
    nom: Role;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: MeApiUser;
}