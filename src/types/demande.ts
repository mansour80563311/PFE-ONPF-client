import type {
  User,
} from "./user";

/*
 * Statuts de traitement d’une demande.
 */
export const StatutDemande = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_COURS: "EN_COURS",
  VALIDEE: "VALIDEE",
  REJETEE: "REJETEE",
} as const;

export type StatutDemande =
  (typeof StatutDemande)[keyof typeof StatutDemande];

/*
 * Statuts possibles de la vérification CNI.
 */
export const StatutVerificationCni = {
  NON_VERIFIEE: "NON_VERIFIEE",
  VERIFIEE: "VERIFIEE",
  ECHEC: "ECHEC",
  INDISPONIBLE: "INDISPONIBLE",
} as const;

export type StatutVerificationCni =
  (typeof StatutVerificationCni)[keyof typeof StatutVerificationCni];

export interface Demande {
  id: string;
  numero: string;

  /*
   * Informations personnelles du demandeur.
   */
  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  telephone: string;
  email?: string | null;

  /*
   * Informations récupérées auprès
   * du service CNI.
   */
  dateNaissanceDemandeur?: string | null;
  adresseDemandeur?: string | null;

  statutVerificationCni:
    StatutVerificationCni;

  dateVerificationCni?: string | null;
  sourceVerificationCni?: string | null;
  referenceVerificationCni?: string | null;
  messageVerificationCni?: string | null;

  /*
   * Informations foncières.
   */
  referenceFonciere: string;
  adresseBien: string;

  /*
   * Traitement de la demande.
   */
  statut: StatutDemande;

  observations?: string | null;
  motifRejet?: string | null;

  /*
   * Agent ayant créé la demande.
   */
  utilisateurId?: string;
  utilisateur: User;

  /*
   * Journal de clôture.
   */
  journalClotureId?: string | null;

  journalCloture?:
    | JournalClotureResume
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDemandeRequest {
  /*
   * Le frontend envoie seulement le CIN.
   *
   * Le backend appelle lui-même le service
   * CNI pour obtenir les informations
   * officielles.
   */
  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  telephone: string;
  email?: string;

  referenceFonciere: string;
  adresseBien: string;

  observations?: string;
}

export interface UpdateDemandeRequest {
  nomDemandeur?: string;
  prenomDemandeur?: string;
  cin?: string;

  telephone?: string;
  email?: string;

  referenceFonciere?: string;
  adresseBien?: string;

  observations?: string;
}

export interface DemandeResponse {
  success: boolean;
  message: string;
  data: Demande;
}

export interface PaginatedDemandes {
  success: boolean;
  message: string;

  data: Demande[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateDemandeStatusRequest {
  statut: StatutDemande;
  motifRejet?: string;
}

export interface HistoriqueUtilisateur {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface HistoriqueStatutDemande {
  id: string;

  ancienStatut:
    StatutDemande;

  nouveauStatut:
    StatutDemande;

  motif?: string | null;

  demandeId: string;
  utilisateurId: string;

  createdAt: string;

  utilisateur:
    HistoriqueUtilisateur;
}

export interface HistoriqueDemandeResponse {
  success: boolean;
  message: string;

  data:
    HistoriqueStatutDemande[];
}

export interface ResponsableJournalCloture {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface JournalClotureResume {
  id: string;
  numero: string;

  dateJour: string;
  dateCloture: string;

  observations?: string | null;

  responsableId: string;

  responsable:
    ResponsableJournalCloture;
}