export interface Role {
  id: string;
  nom: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  login: string;
  statut: boolean;
  role: Role;
  roleId: string;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  login: string;
  password: string;
  roleId: string;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  login?: string;
  password?: string;
  statut?: boolean;
  roleId?: string;
}

export interface PaginatedUsers {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}