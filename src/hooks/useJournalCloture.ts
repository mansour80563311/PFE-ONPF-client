import {
  useCallback,
  useEffect,
  useState,
} from "react";

import journalClotureService from "../services/journal-cloture.service";

import type {
  JournalCloture,
} from "../types/journal-cloture";

interface JournalRequestState {
  requestId: string | null;
  requestVersion: number;
  journal: JournalCloture | null;
  error: boolean;
}

export function useJournalCloture(
  id: string
) {
  /*
   * Permet de relancer la requête avec reload()
   * sans modifier directement loading dans l’effet.
   */
  const [
    reloadVersion,
    setReloadVersion,
  ] = useState(0);

  const [
    requestState,
    setRequestState,
  ] = useState<JournalRequestState>({
    requestId: null,
    requestVersion: -1,
    journal: null,
    error: false,
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const currentRequestVersion =
      reloadVersion;

    journalClotureService
      .getJournal(id)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setRequestState({
          requestId: id,
          requestVersion:
            currentRequestVersion,
          journal: data,
          error: false,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setRequestState({
          requestId: id,
          requestVersion:
            currentRequestVersion,
          journal: null,
          error: true,
        });
      });

    /*
     * Empêche une ancienne requête de modifier
     * l’état après un changement de page ou d’id.
     */
    return () => {
      cancelled = true;
    };
  }, [id, reloadVersion]);

  const isCurrentRequest =
    requestState.requestId === id &&
    requestState.requestVersion ===
      reloadVersion;

  /*
   * Le chargement est maintenant dérivé des
   * informations déjà disponibles.
   */
  const loading =
    Boolean(id) &&
    !isCurrentRequest;

  const journal =
    isCurrentRequest
      ? requestState.journal
      : null;

  const error =
    !id ||
    (isCurrentRequest &&
      requestState.error);

  const reload = useCallback(() => {
    setReloadVersion(
      (currentVersion) =>
        currentVersion + 1
    );
  }, []);

  return {
    journal,
    loading,
    error,
    reload,
  };
}