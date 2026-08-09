import axios from "axios";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import journalCaisseService from "../services/journal-caisse.service";

import type {
  JournalCaisseResume,
  JournauxCaisseResponse,
} from "../types/journal-caisse";

interface ApiErrorResponse {
  message?: string;

  errors?: Array<{
    message?: string;
  }>;
}

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const responseData =
      error.response
        ?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData
        ?.errors?.[0]
        ?.message ??
      responseData
        ?.message ??
      "Impossible de récupérer les journaux de caisse."
    );
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}

export function useJournauxCaisse(
  initialLimit = 10
) {
  const [
    journaux,
    setJournaux,
  ] = useState<
    JournalCaisseResume[]
  >([]);

  /*
   * true au premier affichage.
   *
   * Il n’est donc pas nécessaire d’appeler
   * setLoading(true) dans le useEffect.
   */
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    page,
    setPageState,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const limit =
    initialLimit;

  /**
   * Applique la réponse reçue
   * depuis le backend.
   */
  const applyResponse =
    useCallback(
      (
        response:
          JournauxCaisseResponse
      ) => {
        setJournaux(
          response.data
        );

        setTotal(
          response.meta.total
        );

        setTotalPages(
          response.meta
            .totalPages
        );

        setErrorMessage(
          null
        );
      },
      []
    );

  /**
   * Chargement automatique :
   *
   * - au premier affichage ;
   * - lors du changement de page.
   *
   * La première modification d’état intervient
   * seulement après la réponse asynchrone.
   */
  useEffect(() => {
    let cancelled =
      false;

    const fetchJournaux =
      async () => {
        try {
          const response =
            await journalCaisseService
              .getAll(
                page,
                limit
              );

          if (cancelled) {
            return;
          }

          applyResponse(
            response
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          setErrorMessage(
            getErrorMessage(
              error
            )
          );

          setJournaux(
            []
          );

          setTotal(
            0
          );

          setTotalPages(
            0
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    void fetchJournaux();

    /*
     * Évite de modifier les états lorsque
     * le composant est démonté avant la fin
     * de la requête HTTP.
     */
    return () => {
      cancelled =
        true;
    };
  }, [
    page,
    limit,
    applyResponse,
  ]);

  /**
   * Actualisation manuelle déclenchée
   * par le bouton « Actualiser ».
   *
   * Les setState synchrones sont ici autorisés,
   * car cette fonction est appelée depuis
   * une action utilisateur et non depuis
   * un useEffect.
   */
  const loadJournaux =
    useCallback(
      async () => {
        try {
          setRefreshing(
            true
          );

          setErrorMessage(
            null
          );

          const response =
            await journalCaisseService
              .getAll(
                page,
                limit
              );

          applyResponse(
            response
          );
        } catch (error) {
          setErrorMessage(
            getErrorMessage(
              error
            )
          );
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        page,
        limit,
        applyResponse,
      ]
    );

  /**
   * Changement de page déclenché
   * depuis la pagination.
   */
  const setPage =
    useCallback(
      (
        nextPage: number
      ) => {
        if (
          nextPage < 1 ||
          nextPage === page
        ) {
          return;
        }

        setLoading(
          true
        );

        setPageState(
          nextPage
        );
      },
      [
        page,
      ]
    );

  return {
    journaux,
    loading,
    refreshing,
    errorMessage,

    page,
    setPage,

    limit,
    total,
    totalPages,

    loadJournaux,
  };
}