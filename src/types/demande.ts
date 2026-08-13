import type {
  User,
} from "./user";

import type {
  StatutPaiement,
} from "./paiement";


/**
 * ============================================================
 * STATUT DE LA DEMANDE
 * ============================================================
 */
export const StatutDemande = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_COURS: "EN_COURS",
  VALIDEE: "VALIDEE",
  REJETEE: "REJETEE",
} as const;

export type StatutDemande =
  (typeof StatutDemande)[keyof typeof StatutDemande];


/**
 * ============================================================
 * VERIFICATION CNI
 * ============================================================
 */
export const StatutVerificationCni = {
  NON_VERIFIEE: "NON_VERIFIEE",
  VERIFIEE: "VERIFIEE",
  ECHEC: "ECHEC",
  INDISPONIBLE: "INDISPONIBLE",
} as const;

export type StatutVerificationCni =
  (typeof StatutVerificationCni)[keyof typeof StatutVerificationCni];


/**
 * ============================================================
 * NATURE DE LA DEMANDE
 * ============================================================
 */
export const NatureDemande = {
  INSCRIPTION: "INSCRIPTION",
  PRESTATION: "PRESTATION",
} as const;

export type NatureDemande =
  (typeof NatureDemande)[keyof typeof NatureDemande];


/**
 * ============================================================
 * LANGUE
 * ============================================================
 *
 * L'enum complet est conservé parce que les anciennes
 * demandes peuvent encore contenir ANGLAIS.
 *
 * Pour les nouvelles prestations, le backend accepte
 * actuellement uniquement :
 *
 * - ARABE
 * - FRANCAIS
 */
export const LangueCertificat = {
  FRANCAIS: "FRANCAIS",
  ARABE: "ARABE",
  ANGLAIS: "ANGLAIS",
} as const;

export type LangueCertificat =
  (typeof LangueCertificat)[keyof typeof LangueCertificat];


export type LanguePrestation =
  | typeof LangueCertificat.ARABE
  | typeof LangueCertificat.FRANCAIS;


/**
 * ============================================================
 * TARIFICATION
 * ============================================================
 */
export const StatutTarification = {
  CALCULEE: "CALCULEE",
  FIGEE: "FIGEE",
} as const;

export type StatutTarification =
  (typeof StatutTarification)[keyof typeof StatutTarification];


export const TypeLigneTarification = {
  ARCHIVAGE_DOSSIER:
    "ARCHIVAGE_DOSSIER",

  ETUDE_OPERATION:
    "ETUDE_OPERATION",

  BASE_PRESTATION:
    "BASE_PRESTATION",

  TARIFICATION_PAGE:
    "TARIFICATION_PAGE",

  SUPPLEMENT_FRANCAIS:
    "SUPPLEMENT_FRANCAIS",

  AUTRE:
    "AUTRE",
} as const;

export type TypeLigneTarification =
  (typeof TypeLigneTarification)[keyof typeof TypeLigneTarification];


/**
 * ============================================================
 * CATEGORIE D'OPERATION
 * ============================================================
 */
export const CategorieOperationFonciere = {
  STANDARD: "STANDARD",
  DISTRACTION: "DISTRACTION",
} as const;

export type CategorieOperationFonciere =
  (typeof CategorieOperationFonciere)[keyof typeof CategorieOperationFonciere];


/**
 * ============================================================
 * PAIEMENT RESUME
 * ============================================================
 */
export interface PaiementDemandeResume {
  id: string;

  numeroRecu: string;

  statut:
    StatutPaiement;

  /**
   * Decimal Prisma sérialisé en chaîne JSON.
   */
  montantExigible: string;

  montantEncaisse: string;

  datePaiement: string;
}


/**
 * ============================================================
 * GOUVERNORAT
 * ============================================================
 */
export interface Gouvernorat {
  id: string;

  code: string;

  nom: string;

  actif: boolean;

  createdAt?: string;

  updatedAt?: string;
}


/**
 * ============================================================
 * TITRE FONCIER
 * ============================================================
 *
 * Un titre est identifié métier par :
 *
 * numéro + gouvernorat.
 */
export interface TitreFoncier {
  id: string;

  numero: string;

  gouvernoratId: string;

  gouvernorat:
    Gouvernorat;

  createdAt?: string;

  updatedAt?: string;
}


/**
 * ============================================================
 * TYPE D'OPERATION FONCIERE
 * ============================================================
 */
export interface TypeOperationFonciere {
  id: string;

  code: string;

  libelle: string;

  description?:
    string | null;

  categorie:
    CategorieOperationFonciere;

  actif: boolean;

  createdAt?: string;

  updatedAt?: string;
}


/**
 * ============================================================
 * OPERATION LIEE A UNE DEMANDE
 * ============================================================
 */
export interface DemandeOperationFonciere {
  id: string;

  demandeId: string;

  typeOperationFonciereId:
    string;

  createdAt: string;

  typeOperationFonciere:
    TypeOperationFonciere;
}


/**
 * ============================================================
 * PRESTATION
 * ============================================================
 */
export interface Prestation {
  id: string;

  code: string;

  libelle: string;

  description?:
    string | null;

  tarificationParPage:
    boolean;

  supplementFrancaisApplicable:
    boolean;

  necessiteTitreFoncier:
    boolean;

  actif: boolean;

  createdAt?: string;

  updatedAt?: string;
}


/**
 * ============================================================
 * LIGNE TARIFAIRE
 * ============================================================
 */
export interface LigneTarification {
  id: string;

  tarificationId: string;

  type:
    TypeLigneTarification;

  code: string;

  libelle: string;

  quantite: number;

  /**
   * Decimal Prisma sérialisé en chaîne.
   */
  montantUnitaire: string;

  montant: string;

  ordre: number;

  createdAt: string;
}


/**
 * ============================================================
 * SNAPSHOT TARIFAIRE
 * ============================================================
 */
export interface TarificationDemande {
  id: string;

  demandeId: string;

  nature:
    NatureDemande;

  prestationCode?:
    string | null;

  prestationLibelle?:
    string | null;

  langue?:
    LanguePrestation | null;

  nombrePages?:
    number | null;

  montantTotal: string;

  referenceReglementaire?:
    string | null;

  statut:
    StatutTarification;

  dateCalcul: string;

  dateFigeage?:
    string | null;

  createdAt: string;

  updatedAt: string;

  lignes:
    LigneTarification[];
}


/**
 * ============================================================
 * DEMANDE
 * ============================================================
 */
export interface Demande {
  id: string;

  numero: string;


  /**
   * ----------------------------------------------------------
   * IDENTITE DU DEMANDEUR
   * ----------------------------------------------------------
   */
  nomDemandeur: string;

  prenomDemandeur: string;

  cin: string;

  telephone: string;

  email?:
    string | null;


  /**
   * ----------------------------------------------------------
   * INFORMATIONS CNI
   * ----------------------------------------------------------
   */
  dateNaissanceDemandeur?:
    string | null;

  adresseDemandeur?:
    string | null;

  statutVerificationCni:
    StatutVerificationCni;

  dateVerificationCni?:
    string | null;

  sourceVerificationCni?:
    string | null;

  referenceVerificationCni?:
    string | null;

  messageVerificationCni?:
    string | null;


  /**
   * ----------------------------------------------------------
   * NOUVEAU MODELE METIER
   * ----------------------------------------------------------
   *
   * null correspond notamment aux anciennes demandes
   * créées avant la migration.
   */
  nature?:
    NatureDemande | null;

  titreFoncierId?:
    string | null;

  titreFoncier?:
    TitreFoncier | null;

  operationsFoncieres?:
    DemandeOperationFonciere[];

  prestationId?:
    string | null;

  prestation?:
    Prestation | null;

  nombrePages?:
    number | null;

  tarification?:
    TarificationDemande | null;


  /**
   * ----------------------------------------------------------
   * CHAMPS LEGACY TEMPORAIRES
   * ----------------------------------------------------------
   *
   * Le backend les retourne encore afin de maintenir
   * la compatibilité avec les anciennes demandes.
   *
   * Ils ne doivent plus servir de source de vérité
   * pour les nouvelles demandes.
   */
  nombreExemplaires: number;

  langueCertificat:
    LangueCertificat;

  traductionDemandee: boolean;

  prixUnitaire: string;

  supplementTraduction:
    string;

  montantTotal: string;

  referenceFonciere: string;


  /**
   * ----------------------------------------------------------
   * INFORMATIONS DU BIEN
   * ----------------------------------------------------------
   */
  adresseBien: string;


  /**
   * ----------------------------------------------------------
   * WORKFLOW
   * ----------------------------------------------------------
   */
  statut:
    StatutDemande;

  observations?:
    string | null;

  motifRejet?:
    string | null;


  /**
   * ----------------------------------------------------------
   * PAIEMENT
   * ----------------------------------------------------------
   */
  paiement?:
    | PaiementDemandeResume
    | null;


  /**
   * ----------------------------------------------------------
   * UTILISATEUR
   * ----------------------------------------------------------
   */
  utilisateurId?:
    string;

  utilisateur:
    User;


  /**
   * ----------------------------------------------------------
   * CLOTURE
   * ----------------------------------------------------------
   */
  journalClotureId?:
    string | null;

  journalCloture?:
    | JournalClotureResume
    | null;


  createdAt: string;

  updatedAt: string;
}


/**
 * ============================================================
 * DONNEES COMMUNES A LA CREATION
 * ============================================================
 */
export interface CreateDemandeBaseRequest {
  /**
   * Le backend vérifie le CIN et peut remplacer
   * nom/prénom par les données retournées
   * par le service CNI.
   */
  nomDemandeur: string;

  prenomDemandeur: string;

  cin: string;

  telephone: string;

  email?: string;

  adresseBien: string;

  observations?: string;
}


/**
 * ============================================================
 * CREATION D'UNE INSCRIPTION
 * ============================================================
 */
export interface CreateInscriptionDemandeRequest
  extends CreateDemandeBaseRequest {
  nature:
    typeof NatureDemande.INSCRIPTION;

  gouvernoratId: string;

  numeroTitreFoncier:
    string;

  /**
   * Au moins une opération.
   *
   * Exemple :
   *
   * Vente + Hypothèque.
   */
  operationFonciereIds:
    string[];
}


/**
 * ============================================================
 * CREATION D'UNE PRESTATION
 * ============================================================
 */
export interface CreatePrestationDemandeRequest
  extends CreateDemandeBaseRequest {
  nature:
    typeof NatureDemande.PRESTATION;

  prestationId: string;

  /**
   * Certains services nécessitent un titre foncier,
   * d'autres non.
   */
  gouvernoratId?:
    string;

  numeroTitreFoncier?:
    string;

  /**
   * Requis uniquement si la prestation
   * est tarifée par page.
   */
  nombrePages?:
    number;

  langue:
    LanguePrestation;
}


/**
 * Le type envoyé à POST /api/demandes.
 *
 * TypeScript peut maintenant déterminer automatiquement
 * les champs nécessaires selon la nature choisie.
 */
export type CreateDemandeRequest =
  | CreateInscriptionDemandeRequest
  | CreatePrestationDemandeRequest;


/**
 * ============================================================
 * MODIFICATION D'UNE DEMANDE
 * ============================================================
 *
 * nature n'est volontairement PAS présente :
 * une demande INSCRIPTION ne devient pas PRESTATION
 * après sa création, et inversement.
 */
export interface UpdateDemandeRequest {
  nomDemandeur?:
    string;

  prenomDemandeur?:
    string;

  cin?:
    string;

  telephone?:
    string;

  email?:
    string;

  adresseBien?:
    string;

  observations?:
    string;


  /**
   * Nouveau titre foncier.
   */
  gouvernoratId?:
    string;

  numeroTitreFoncier?:
    string;


  /**
   * INSCRIPTION.
   */
  operationFonciereIds?:
    string[];


  /**
   * PRESTATION.
   */
  prestationId?:
    string;

  nombrePages?:
    number;

  langue?:
    LanguePrestation;


  /**
   * ----------------------------------------------------------
   * LEGACY
   * ----------------------------------------------------------
   *
   * Ces champs restent typés uniquement pour permettre
   * l'éventuelle modification d'anciennes demandes
   * nature = null.
   *
   * Ils ne doivent jamais être envoyés pour une
   * nouvelle demande.
   */
  referenceFonciere?:
    string;

  nombreExemplaires?:
    number;

  langueCertificat?:
    LangueCertificat;

  traductionDemandee?:
    boolean;
}


/**
 * ============================================================
 * REPONSES API
 * ============================================================
 */
export interface DemandeResponse {
  success: boolean;

  message: string;

  data:
    Demande;
}


export interface PaginatedDemandes {
  success: boolean;

  message: string;

  data:
    Demande[];

  meta: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}


/**
 * ============================================================
 * CHANGEMENT DE STATUT
 * ============================================================
 */
export interface UpdateDemandeStatusRequest {
  statut:
    StatutDemande;

  motifRejet?:
    string;
}


/**
 * ============================================================
 * HISTORIQUE
 * ============================================================
 */
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

  motif?:
    string | null;

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


/**
 * ============================================================
 * JOURNAL DE CLOTURE
 * ============================================================
 */
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

  observations?:
    string | null;

  responsableId: string;

  responsable:
    ResponsableJournalCloture;
}