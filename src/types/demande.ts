import type {
  User,
} from "./user";

import type {
  StatutPaiement,
} from "./paiement";

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

/*
 * Langues disponibles pour le certificat.
 *
 * Le français est actuellement la langue
 * de base. L’arabe et l’anglais nécessitent
 * le supplément de traduction.
 */
export const LangueCertificat = {
  FRANCAIS: "FRANCAIS",
  ARABE: "ARABE",
  ANGLAIS: "ANGLAIS",
} as const;

export type LangueCertificat =
  (typeof LangueCertificat)[keyof typeof LangueCertificat];

/*
 * Résumé du paiement retourné avec
 * une demande.
 *
 * Lorsque paiement vaut null, aucun
 * encaissement n’a encore été réalisé.
 */
export interface PaiementDemandeResume {
  id: string;
  numeroRecu: string;

  statut:
    StatutPaiement;

  /*
   * Les Decimal Prisma sont reçus
   * sous forme de chaînes JSON.
   */
  montantExigible: string;
  montantEncaisse: string;

  datePaiement: string;
}

export interface Demande {
  id: string;
  numero: string;

  /*
   * Informations personnelles
   * du demandeur.
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

  /*
   * Informations tarifaires
   * du certificat.
   */
  nombreExemplaires: number;

  langueCertificat:
    LangueCertificat;

  traductionDemandee: boolean;

  /*
   * Les Decimal Prisma sont généralement
   * reçus sous forme de chaînes JSON.
   */
  prixUnitaire: string;

  supplementTraduction:
    string;

  montantTotal: string;

  /*
   * Informations foncières.
   */
  referenceFonciere: string;
  adresseBien: string;

  /*
   * Statut de traitement de la demande.
   *
   * Ce statut reste indépendant
   * du statut de paiement.
   */
  statut:
    StatutDemande;

  observations?: string | null;
  motifRejet?: string | null;

  /*
   * Paiement de la demande.
   *
   * undefined :
   * la route utilisée n’a pas retourné
   * la relation paiement.
   *
   * null :
   * aucun paiement n’existe.
   *
   * objet :
   * un paiement a été enregistré.
   */
  paiement?:
    | PaiementDemandeResume
    | null;

  /*
   * Agent ayant créé la demande.
   */
  utilisateurId?: string;

  utilisateur:
    User;

  /*
   * Journal de clôture.
   */
  journalClotureId?:
    string | null;

  journalCloture?:
    | JournalClotureResume
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDemandeRequest {
  /*
   * Le backend vérifie lui-même le CIN
   * et remplace le nom et le prénom par
   * les informations officielles.
   */
  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  telephone: string;
  email?: string;

  /*
   * Paramètres utilisés par le backend
   * pour calculer le montant.
   */
  nombreExemplaires: number;

  langueCertificat:
    LangueCertificat;

  traductionDemandee: boolean;

  /*
   * Le frontend n’envoie jamais :
   *
   * - prixUnitaire ;
   * - supplementTraduction ;
   * - montantTotal.
   */
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

  nombreExemplaires?: number;

  langueCertificat?:
    LangueCertificat;

  traductionDemandee?: boolean;

  referenceFonciere?: string;
  adresseBien?: string;

  observations?: string;
}

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

export interface UpdateDemandeStatusRequest {
  statut:
    StatutDemande;

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