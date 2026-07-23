export const TypeDocument = {
  CIN: "CIN",
  PASSEPORT: "PASSEPORT",
  CONTRAT: "CONTRAT",
  PROCURATION: "PROCURATION",
} as const;

export type TypeDocument =
  (typeof TypeDocument)[keyof typeof TypeDocument];

export const StatutDocument = {
  DEPOSE: "DEPOSE",
  CONFORME: "CONFORME",
  NON_CONFORME: "NON_CONFORME",
} as const;

export type StatutDocument =
  (typeof StatutDocument)[keyof typeof StatutDocument];

export interface DocumentUtilisateur {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface DemandeDocument {
  id: string;

  type: TypeDocument;

  nomOriginal: string;
  nomStockage: string;
  cheminFichier: string;
  mimeType: string;
  taille: number;

  statut: StatutDocument;
  motifNonConformite?: string | null;

  demandeId: string;
  utilisateurId: string;

  createdAt: string;
  updatedAt: string;

  utilisateur: DocumentUtilisateur;
}

export interface UploadDemandeDocumentRequest {
  type: TypeDocument;
  file: File;
}

export interface UpdateDocumentStatusRequest {
  statut: StatutDocument;
  motifNonConformite?: string;
}

export interface DemandeDocumentResponse {
  success: boolean;
  message: string;
  data: DemandeDocument;
}

export interface DemandeDocumentsResponse {
  success: boolean;
  message: string;
  data: DemandeDocument[];
}