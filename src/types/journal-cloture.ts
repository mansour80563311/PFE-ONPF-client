import type {
  NatureDemande,
  StatutDemande,
} from "./demande";

export interface ResponsableCloture {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface GouvernoratCloture {
  id: string;
  code: string;
  nom: string;
}

export interface TitreFoncierCloture {
  numero: string;
  gouvernorat: GouvernoratCloture;
}

export interface PrestationCloture {
  id: string;
  code: string;
  libelle: string;
}

export interface DemandeCloture {
  id: string;
  numero: string;
  nomDemandeur: string;
  prenomDemandeur: string;
  cin?: string;

  /**
   * Nouveau modèle métier.
   *
   * nature peut rester absente/null pour les anciennes
   * demandes conservées pendant la migration.
   */
  nature?: NatureDemande | null;

  titreFoncier?: TitreFoncierCloture | null;

  prestation?: PrestationCloture | null;

  /**
   * Champ legacy conservé uniquement comme solution de repli
   * pour les anciennes demandes.
   */
  referenceFonciere?: string | null;

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
