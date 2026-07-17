import api from "../api/axios";

import type {
  PaginatedUsers,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/user";

class UserService {
  async getUsers(page = 1, limit = 10, search = "") {
    const response = await api.get<PaginatedUsers>(
      `/users?page=${page}&limit=${limit}&search=${search}`
    );

    return response.data;
  }

  async getUser(id: string) {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: User;
    }>(`/users/${id}`);

    return response.data;
  }

  async createUser(data: CreateUserRequest) {
    const response = await api.post(
      "/users",
      data
    );

    return response.data;
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ) {
    const response = await api.put(
      `/users/${id}`,
      data
    );

    return response.data;
  }

  async deleteUser(id: string) {
    const response = await api.delete(
      `/users/${id}`
    );

    return response.data;
  }
}

export default new UserService();