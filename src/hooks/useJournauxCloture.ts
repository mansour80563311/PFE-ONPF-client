import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import journalClotureService from "../services/journal-cloture.service";
import { useDebounce } from "./useDebounce";

import type {
  JournalCloture,
} from "../types/journal-cloture";

export function useJournauxCloture() {
  const [journaux, setJournaux] =
    useState<JournalCloture[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searching, setSearching] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 300);

  /*
   * Permet de distinguer le premier chargement
   * des recherches et changements de page suivants.
   */
  const firstLoadRef = useRef(true);

  const loadJournaux =
    useCallback(async () => {
      if (!firstLoadRef.current) {
        setSearching(true);
      }

      try {
        const result =
          await journalClotureService.getJournaux(
            page,
            10,
            debouncedSearch
          );

        setJournaux(result.journaux);
        setTotalPages(result.totalPages);
      } finally {
        setLoading(false);
        setSearching(false);
        firstLoadRef.current = false;
      }
    }, [page, debouncedSearch]);

  useEffect(() => {
    async function fetchJournaux() {
      await loadJournaux();
    }

    void fetchJournaux();
  }, [loadJournaux]);

  /*
   * La page est remise à 1 directement
   * lors d’un changement de recherche.
   */
  const updateSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    []
  );

  return {
    journaux,
    loading,
    searching,
    page,
    totalPages,
    search,
    setPage,

    // On conserve le nom setSearch pour les composants.
    setSearch: updateSearch,

    reload: loadJournaux,
  };
}