import {
  useCallback,
  useEffect,
  useState,
} from "react";

import demandeService from "../services/demande.service";

import type { Demande } from "../types/demande";

export function useDemande(id: string) {
  const [demande, setDemande] =
    useState<Demande | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadDemande = useCallback(
    async () => {
      setLoading(true);

      try {
        const response =
          await demandeService.getDemande(id);

        setDemande(response.data);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    async function fetchDemande() {
      await loadDemande();
    }

    void fetchDemande();
  }, [loadDemande]);

  return {
    demande,
    loading,
    reload: loadDemande,
  };
}