import { useCallback, useEffect, useState } from "react";

import demandeService from "../services/demande.service";

import type { Demande } from "../types/demande";

import { useDebounce } from "./useDebounce";

export function useDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const loadDemandes = useCallback(async () => {
    try {
      if (!loading) {
        setSearching(true);
      }

      const response =
        await demandeService.getDemandes(
          page,
          10,
          debouncedSearch
        );

      setDemandes(response.data);
      setTotalPages(response.meta.totalPages);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [debouncedSearch, page, loading]);

    useEffect(() => {
    async function fetchDemandes() {
        await loadDemandes();
    }

    void fetchDemandes();
    }, [loadDemandes]);

  return {
    demandes,
    loading,
    searching,

    search,
    setSearch,

    page,
    setPage,

    totalPages,

    loadDemandes,
  };
}