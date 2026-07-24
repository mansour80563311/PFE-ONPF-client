import {
  useCallback,
  useEffect,
  useState,
} from "react";

import journalClotureService from "../services/journal-cloture.service";

import type {
  JournalCloture,
} from "../types/journal-cloture";

export function useJournalCloture(
  id: string
) {
  const [journal, setJournal] =
    useState<JournalCloture | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadJournal =
    useCallback(async () => {
      setLoading(true);

      try {
        const data =
          await journalClotureService.getJournal(
            id
          );

        setJournal(data);
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    async function fetchJournal() {
      await loadJournal();
    }

    void fetchJournal();
  }, [loadJournal]);

  return {
    journal,
    loading,
    reload: loadJournal,
  };
}