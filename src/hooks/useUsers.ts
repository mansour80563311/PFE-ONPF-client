import { useCallback, useEffect, useState } from "react";

import userService from "../services/user.service";

import type { User } from "../types/user";
import { useDebounce } from "./useDebounce";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const loadUsers = useCallback(async () => {
  try {
    if (!loading) {
      setSearching(true);
    }

    const response = await userService.getUsers(
      page,
      10,
      debouncedSearch
    );

    setUsers(response.data);
    setTotalPages(response.meta.totalPages);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
    setSearching(false);
  }
}, [debouncedSearch, page, loading]);

  useEffect(() => {
    async function fetchUsers() {
      await loadUsers();
    }

    void fetchUsers();
  }, [loadUsers]);

return {
  users,
  loading,
  searching,
  search,
  setSearch,
  page,
  setPage,
  totalPages,
  loadUsers,
};
}