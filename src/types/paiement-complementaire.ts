import type {
  DemandeOperationFonciere,
  NatureDemande,
  TarificationDemande,
  TitreFoncier,
} from "./demande";

import type {
  CreatePaiementRequest,
  ModePaiement,
  StatutPaiement,
} from "./paiement";

import type {
  RevisionDemande,
  StatutRevisionDemande,
} from "./responsable-demande";


/**
 * ============================================================
 * DONNEES D'ENCAISSEMENT
 * ============================================================
 */
export type CreatePaiementComplementaireRequest =
  CreatePaiementRequest;


export interface PaiementComplementaireRole {
  id: string;

  nom: string;
}

export interface PaiementComplementaireCaissier {
  id: string;

  nom: string;

  prenom: string;

  login: string;

  role:
    PaiementComplementaireRole;
}

export interface JournalCaissePaiementComplementaireResume {
  id: string;

  numero: string;

  dateJour: string;

  statut: string;
}


/**
 * La réponse du paiement complémentaire n'embarque pas le même
 * include Prisma que GET /demandes/:id. On type donc seulement
 * les informations réellement utiles au frontend.
 */
export interface PaiementComplementaireDemande {
  id: string;

  numero: string;

  nomDemandeur: string;

  prenomDemandeur: string;

  cin: string;

  telephone?: string;

  email?:
    string | null;

  referenceFonciere:
    string;

  nature?:
    NatureDemande | null;

  statut: string;

  titreFoncier?:
    TitreFoncier | null;

  operationsFoncieres?:
    DemandeOperationFonciere[];

  tarification?:
    TarificationDemande | null;
}


/**
 * ============================================================
 * PAIEMENT COMPLEMENTAIRE COMPLET
 * ============================================================
 */
export interface PaiementComplementaire {
  id: string;

  numeroRecu: string;

  montantExigible: string;

  montantRemis: string;

  monnaieRendue: string;

  montantEncaisse: string;

  modePaiement:
    ModePaiement;

  statut:
    StatutPaiement;

  montantEnLettres?:
    string | null;

  observations?:
    string | null;

  datePaiement: string;

  demandeId: string;

  revisionId: string;

  caissierId: string;

  journalCaisseId: string;

  createdAt: string;

  updatedAt: string;

  caissier:
    PaiementComplementaireCaissier;

  demande:
    PaiementComplementaireDemande;

  revision:
    RevisionDemande;

  journalCaisse:
    JournalCaissePaiementComplementaireResume;
}


/**
 * ============================================================
 * ETAT DE REGULARISATION
 * ============================================================
 */
export interface RegularisationTarifaire {
  revisionId: string;

  numeroRevision: number;

  montantAvant: string;

  montantApres: string;

  complementDu: string;

  statut:
    StatutRevisionDemande;
}

export interface EtatPaiementComplementaireData {
  revision:
    | RevisionDemande
    | null;

  paiement:
    | PaiementComplementaire
    | null;

  regularisation:
    | RegularisationTarifaire
    | null;
}

export interface EtatPaiementComplementaireResponse {
  success: boolean;

  message: string;

  data:
    EtatPaiementComplementaireData;
}


/**
 * ============================================================
 * REPONSE APRES ENCAISSEMENT
 * ============================================================
 */
export interface RegularisationApresPaiement {
  revisionId: string;

  numeroRevision: number;

  montantAvant: string;

  montantApres: string;

  complementPaye: string;

  statut:
    Extract<
      StatutRevisionDemande,
      "COMPLEMENT_PAYE"
    >;
}

export interface CreatePaiementComplementaireData {
  paiement:
    PaiementComplementaire;

  regularisation:
    RegularisationApresPaiement;
}

export interface CreatePaiementComplementaireResponse {
  success: boolean;

  message: string;

  data:
    CreatePaiementComplementaireData;
}
