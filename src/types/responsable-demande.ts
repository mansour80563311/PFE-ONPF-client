import type {
  Demande,
} from "./demande";


/**
 * ============================================================
 * STATUT D'UNE REVISION RESPONSABLE
 * ============================================================
 */
export const StatutRevisionDemande = {
  SANS_COMPLEMENT:
    "SANS_COMPLEMENT",

  COMPLEMENT_A_PAYER:
    "COMPLEMENT_A_PAYER",

  COMPLEMENT_PAYE:
    "COMPLEMENT_PAYE",
} as const;

export type StatutRevisionDemande =
  (typeof StatutRevisionDemande)[keyof typeof StatutRevisionDemande];


/**
 * ============================================================
 * UTILISATEUR RESPONSABLE
 * ============================================================
 */
export interface RevisionResponsable {
  id: string;

  nom: string;

  prenom: string;

  login: string;
}


/**
 * ============================================================
 * SNAPSHOT METIER D'UNE INSCRIPTION
 * ============================================================
 *
 * Le backend conserve l'état avant et après chaque correction
 * afin de rendre les modifications du Responsable auditables.
 */
export interface RevisionOperationFonciereSnapshot {
  id: string;

  code: string;

  libelle: string;
}

export interface RevisionGouvernoratSnapshot {
  id: string;

  code: string;

  nom: string;
}

export interface RevisionInscriptionSnapshot {
  nature:
    "INSCRIPTION";

  numeroTitreFoncier:
    string;

  gouvernorat:
    RevisionGouvernoratSnapshot;

  operations:
    RevisionOperationFonciereSnapshot[];
}


/**
 * ============================================================
 * LIGNE TARIFAIRE D'UNE REVISION
 * ============================================================
 */
export interface LigneRevisionTarification {
  id: string;

  revisionId: string;

  type: string;

  code:
    string | null;

  libelle: string;

  quantite: number;

  montantUnitaire:
    string;

  montant: string;

  ordre: number;

  createdAt: string;
}


/**
 * ============================================================
 * PAIEMENT COMPLEMENTAIRE RESUME
 * ============================================================
 *
 * Cette version résumée est incluse directement dans la
 * dernière révision renvoyée par le backend.
 */
export interface PaiementComplementaireResume {
  id: string;

  numeroRecu: string;

  statut: string;

  montantExigible:
    string;

  montantEncaisse:
    string;

  datePaiement: string;
}


/**
 * ============================================================
 * REVISION D'UNE DEMANDE
 * ============================================================
 */
export interface RevisionDemande {
  id: string;

  demandeId: string;

  numeroRevision: number;

  responsableId: string;

  donneesAvant:
    RevisionInscriptionSnapshot;

  donneesApres:
    RevisionInscriptionSnapshot;

  motif:
    string | null;

  montantAvant: string;

  montantApres: string;

  complementDu: string;

  referenceReglementaire:
    string | null;

  statut:
    StatutRevisionDemande;

  createdAt: string;

  updatedAt: string;

  responsable:
    RevisionResponsable;

  lignes:
    LigneRevisionTarification[];

  paiementComplementaire?:
    | PaiementComplementaireResume
    | null;
}


/**
 * ============================================================
 * CORRECTION RESPONSABLE
 * ============================================================
 */
export interface CorrigerDemandeResponsableRequest {
  numeroTitreFoncier?:
    string;

  gouvernoratId?:
    string;

  operationFonciereIds?:
    string[];

  motif?: string;
}


export interface ResumeTarificationRevision {
  montantAvant: string;

  montantApres: string;

  complementDu: string;

  complementRequis:
    boolean;
}


/**
 * Le repository backend sélectionne volontairement seulement
 * quelques champs de l'utilisateur dans la réponse de correction.
 */
export interface DemandeUtilisateurResponsableResume {
  id: string;

  nom: string;

  prenom: string;

  login: string;
}

export type DemandeApresCorrectionResponsable =
  Omit<Demande, "utilisateur"> & {
    utilisateur:
      DemandeUtilisateurResponsableResume;
  };


export interface CorrectionResponsableData {
  demande:
    DemandeApresCorrectionResponsable;

  revision:
    RevisionDemande;

  resumeTarification:
    ResumeTarificationRevision;
}

export interface CorrectionResponsableResponse {
  success: boolean;

  message: string;

  data:
    CorrectionResponsableData;
}
