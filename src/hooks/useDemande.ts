import { useEffect, useState } from "react";

import demandeService from "../services/demande.service";

import type { Demande } from "../types/demande";

export function useDemande(id: string) {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDemande() {
      try {
        const response = await demandeService.getDemande(id);
        setDemande(response.data);
      } finally {
        setLoading(false);
      }
    }

    void loadDemande();
  }, [id]);

  return {
    demande,
    loading,
  };
}