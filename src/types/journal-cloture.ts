import type {
  StatutDemande,
} from "./demande";

export interface ResponsableCloture {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface DemandeCloture {
  id: string;
  numero: string;
  nomDemandeur: string;
  prenomDemandeur: string;
  cin?: string;
  referenceFonciere?: string;
  statut: StatutDemande;
  motifRejet?: string | null;
  updatedAt?: string;
}

export interface JournalCloture {
  id: string;
  numero: string;
  dateJour: string;
  dateCloture: string;
  observations?: string | null;

  responsableId: string;
  responsable: ResponsableCloture;

  demandes?: DemandeCloture[];

  _count?: {
    demandes: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalClotureRequest {
  dateJour: string;
  observations?: string;
}

export interface JournalClotureResponse {
  success: boolean;
  message: string;
  data: JournalCloture;
}

export interface JournauxClotureResponse {
  success: boolean;
  message: string;
  data: JournalCloture[];

  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PreviewClotureResponse {
  success: boolean;
  message: string;
  data: DemandeCloture[];
}

export interface PaginatedJournauxCloture {
  journaux: JournalCloture[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}