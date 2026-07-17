import { useEffect, useState } from "react";

import roleService from "../services/role.service";

import type { Role } from "../types/role";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await roleService.getRoles();
        setRoles(response.data);
      } finally {
        setLoading(false);
      }
    }

    void loadRoles();
  }, []);

  return {
    roles,
    loading,
  };
}