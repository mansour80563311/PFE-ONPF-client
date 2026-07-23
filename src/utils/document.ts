import {
  StatutDocument,
  TypeDocument,
} from "../types/demande-document";

export function getDocumentTypeLabel(
  type: TypeDocument
): string {
  switch (type) {
    case TypeDocument.CIN:
      return "Carte d’identité nationale";

    case TypeDocument.PASSEPORT:
      return "Passeport";

    case TypeDocument.CONTRAT:
      return "Contrat";

    case TypeDocument.PROCURATION:
      return "Procuration";
  }
}

export function getDocumentStatusLabel(
  statut: StatutDocument
): string {
  switch (statut) {
    case StatutDocument.DEPOSE:
      return "Déposé";

    case StatutDocument.CONFORME:
      return "Conforme";

    case StatutDocument.NON_CONFORME:
      return "Non conforme";
  }
}

export function getDocumentStatusColor(
  statut: StatutDocument
): "warning" | "success" | "error" {
  switch (statut) {
    case StatutDocument.DEPOSE:
      return "warning";

    case StatutDocument.CONFORME:
      return "success";

    case StatutDocument.NON_CONFORME:
      return "error";
  }
}

export function formatFileSize(
  sizeInBytes: number
): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} octets`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(
      sizeInBytes / 1024
    ).toFixed(1)} Ko`;
  }

  return `${(
    sizeInBytes /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
}