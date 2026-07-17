import { useEffect, useState } from "react";

import userService from "../services/user.service";

import type { User } from "../types/user";

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await userService.getUser(id);
        setUser(response.data);
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  return {
    user,
    loading,
  };
}