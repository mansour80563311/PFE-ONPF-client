import api from "../api/axios";
import type { Role } from "../types/role";

class RoleService {

  async getRoles() {

    const response = await api.get<{
      success: boolean;
      message: string;
      data: Role[];
    }>("/roles");

    return response.data;

  }

}

export default new RoleService();