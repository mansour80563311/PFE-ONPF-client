import axios from "axios";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import demandeService from "../services/demande.service";

import type {
  Demande,
} from "../types/demande";

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getDemandeErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData?.errors?.[0]
        ?.message ??
      responseData?.message ??
      "Impossible de charger la demande."
    );
  }

  return "Impossible de charger la demande.";
}

export function useDemande(
  id: string
) {
  const [
    demande,
    setDemande,
  ] = useState<Demande | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  /*
   * Cette fonction est utilisée pour les
   * rechargements déclenchés manuellement
   * après une modification.
   */
  const loadDemande =
    useCallback(
      async () => {
        if (!id) {
          setDemande(null);

          setErrorMessage(
            "Identifiant de la demande manquant."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const response =
            await demandeService
              .getDemande(id);

          setDemande(
            response.data
          );
        } catch (error) {
          console.error(
            "Erreur chargement demande :",
            error
          );

          setDemande(null);

          setErrorMessage(
            getDemandeErrorMessage(
              error
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  /*
   * Chargement initial.
   *
   * Cette requête est séparée de
   * loadDemande afin de ne pas appeler
   * directement une fonction contenant
   * des setState synchrones dans l’effet.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchInitialDemande =
      async () => {
        /*
         * Le premier changement d’état
         * intervient après une opération
         * asynchrone, conformément à la
         * règle React.
         */
        await Promise.resolve();

        if (cancelled) {
          return;
        }

        if (!id) {
          setDemande(null);

          setErrorMessage(
            "Identifiant de la demande manquant."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const response =
            await demandeService
              .getDemande(id);

          if (cancelled) {
            return;
          }

          setDemande(
            response.data
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Erreur chargement demande :",
            error
          );

          setDemande(null);

          setErrorMessage(
            getDemandeErrorMessage(
              error
            )
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void fetchInitialDemande();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    demande,
    loading,
    errorMessage,
    reload: loadDemande,
  };
}