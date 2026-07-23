import {
  useCallback,
  useEffect,
  useState,
} from "react";

import demandeService from "../services/demande.service";

import type {
  HistoriqueStatutDemande,
} from "../types/demande";

export function useDemandeHistory(id: string) {
  const [historique, setHistorique] =
    useState<HistoriqueStatutDemande[]>([]);

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [historyError, setHistoryError] =
    useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(false);

    try {
      const data =
        await demandeService.getHistory(id);

      setHistorique(data);
    } catch {
      setHistoryError(true);
    } finally {
      setLoadingHistory(false);
    }
  }, [id]);

  useEffect(() => {
    async function fetchHistory() {
      await loadHistory();
    }

    void fetchHistory();
  }, [loadHistory]);

  return {
    historique,
    loadingHistory,
    historyError,
    reloadHistory: loadHistory,
  };
}