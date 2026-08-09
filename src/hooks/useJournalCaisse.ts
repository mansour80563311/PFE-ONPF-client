import axios from "axios";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import journalCaisseService from "../services/journal-caisse.service";

import type {
  CloseJournalCaisseRequest,
  JournalCaisseDetail,
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
      error.response?.data as
        | ApiErrorResponse
        | undefined;

    return (
      responseData
        ?.errors?.[0]
        ?.message ??
      responseData
        ?.message ??
      "Impossible de récupérer le journal de caisse."
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

export function useJournalCaisse(
  journalId: string
) {
  const [
    journal,
    setJournal,
  ] = useState<
    JournalCaisseDetail | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    closing,
    setClosing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<
    string | null
  >(null);

  /*
   * Chargement automatique du journal.
   *
   * Aucun setState n’est appelé directement
   * avant la partie asynchrone, afin d’éviter
   * l’erreur React rencontrée précédemment.
   */
  useEffect(() => {
    let cancelled =
      false;

    const fetchJournal =
      async () => {
        try {
          const result =
            await journalCaisseService
              .getById(
                journalId
              );

          if (cancelled) {
            return;
          }

          setJournal(
            result
          );

          setErrorMessage(
            null
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          setJournal(
            null
          );

          setErrorMessage(
            getErrorMessage(
              error
            )
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

    void fetchJournal();

    return () => {
      cancelled =
        true;
    };
  }, [journalId]);

  /*
   * Actualisation manuelle.
   */
  const reload =
    useCallback(
      async () => {
        try {
          setRefreshing(
            true
          );

          setErrorMessage(
            null
          );

          const result =
            await journalCaisseService
              .getById(
                journalId
              );

          setJournal(
            result
          );

          return result;
        } catch (error) {
          const message =
            getErrorMessage(
              error
            );

          setErrorMessage(
            message
          );
            throw new Error(
            message,
            {
                cause: error,
            }
            );
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [journalId]
    );

  /*
   * Clôture du journal puis rechargement
   * de son détail complet.
   */
  const closeJournal =
    useCallback(
      async (
        data:
          CloseJournalCaisseRequest
      ) => {
        try {
          setClosing(
            true
          );

          setErrorMessage(
            null
          );

          await journalCaisseService
            .close(
              journalId,
              data
            );

          const updatedJournal =
            await journalCaisseService
              .getById(
                journalId
              );

          setJournal(
            updatedJournal
          );

          return updatedJournal;
        } catch (error) {
          const message =
            getErrorMessage(
              error
            );

          setErrorMessage(
            message
          );

          throw new Error(
            message,
            {
              cause: error,
            }
          );
        } finally {
          setClosing(
            false
          );
        }
      },
      [journalId]
    );

  return {
    journal,
    loading,
    refreshing,
    closing,
    errorMessage,
    reload,
    closeJournal,
  };
}