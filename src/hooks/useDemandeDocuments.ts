import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import demandeDocumentService from "../services/demande-document.service";

import {
  TypeDocument,
} from "../types/demande-document";

import type {
  DemandeDocument,
} from "../types/demande-document";

export function useDemandeDocuments(
  demandeId: string
) {
  const [
    documents,
    setDocuments,
  ] = useState<DemandeDocument[]>([]);

  const [
    loadingDocuments,
    setLoadingDocuments,
  ] = useState(true);

  const [
    documentsError,
    setDocumentsError,
  ] = useState(false);


  const loadDocuments =
    useCallback(
      async () => {
        setLoadingDocuments(
          true
        );

        setDocumentsError(
          false
        );

        try {
          const data =
            await demandeDocumentService
              .getDocuments(
                demandeId
              );

          setDocuments(
            data
          );
        } catch {
          setDocumentsError(
            true
          );
        } finally {
          setLoadingDocuments(
            false
          );
        }
      },
      [demandeId]
    );


  useEffect(
    () => {
      async function fetchDocuments() {
        await loadDocuments();
      }

      void fetchDocuments();
    },
    [loadDocuments]
  );


  /**
   * ==========================================================
   * COMPLETUDE DOCUMENTAIRE
   * ==========================================================
   *
   * Pour pouvoir procéder au paiement puis à la
   * transmission, le dossier doit contenir :
   *
   * - une CIN OU un passeport ;
   * - un contrat ;
   * - une procuration.
   *
   * À ce stade, on vérifie uniquement la présence.
   * La conformité est contrôlée plus tard par le
   * Responsable lorsque la demande est EN_COURS.
   */
  const documentSummary =
    useMemo(
      () => {
        const hasIdentityDocument =
          documents.some(
            (document) =>
              document.type ===
                TypeDocument.CIN ||
              document.type ===
                TypeDocument.PASSEPORT
          );

        const hasContrat =
          documents.some(
            (document) =>
              document.type ===
              TypeDocument.CONTRAT
          );

        const hasProcuration =
          documents.some(
            (document) =>
              document.type ===
              TypeDocument.PROCURATION
          );

        const missingRequiredDocuments:
          string[] = [];

        if (!hasIdentityDocument) {
          missingRequiredDocuments.push(
            "CIN ou passeport"
          );
        }

        if (!hasContrat) {
          missingRequiredDocuments.push(
            "contrat"
          );
        }

        if (!hasProcuration) {
          missingRequiredDocuments.push(
            "procuration"
          );
        }

        return {
          hasIdentityDocument,
          hasContrat,
          hasProcuration,

          missingRequiredDocuments,

          dossierDocumentaireComplet:
            missingRequiredDocuments.length ===
            0,
        };
      },
      [documents]
    );


  return {
    documents,
    loadingDocuments,
    documentsError,
    reloadDocuments:
      loadDocuments,

    ...documentSummary,
  };
}