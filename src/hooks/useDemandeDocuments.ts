import {
  useCallback,
  useEffect,
  useState,
} from "react";

import demandeDocumentService from "../services/demande-document.service";

import type {
  DemandeDocument,
} from "../types/demande-document";

export function useDemandeDocuments(
  demandeId: string
) {
  const [documents, setDocuments] =
    useState<DemandeDocument[]>([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [documentsError, setDocumentsError] =
    useState(false);

  const loadDocuments = useCallback(
    async () => {
      setLoadingDocuments(true);
      setDocumentsError(false);

      try {
        const data =
          await demandeDocumentService.getDocuments(
            demandeId
          );

        setDocuments(data);
      } catch {
        setDocumentsError(true);
      } finally {
        setLoadingDocuments(false);
      }
    },
    [demandeId]
  );

  useEffect(() => {
    async function fetchDocuments() {
      await loadDocuments();
    }

    void fetchDocuments();
  }, [loadDocuments]);

  return {
    documents,
    loadingDocuments,
    documentsError,
    reloadDocuments: loadDocuments,
  };
}