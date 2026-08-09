/*
 * Statuts possibles d’un journal
 * de caisse.
 */
export const StatutJournalCaisse = {
  OUVERT: "OUVERT",
  CLOTURE: "CLOTURE",
} as const;

export type StatutJournalCaisse =
  (typeof StatutJournalCaisse)[keyof typeof StatutJournalCaisse];

/*
 * Informations publiques du rôle
 * du Caissier.
 */
export interface JournalCaisseRole {
  id: string;
  nom: string;
}

/*
 * Informations publiques du Caissier.
 */
export interface JournalCaisseCaissier {
  id: string;
  nom: string;
  prenom: string;
  login: string;
  email: string;
  statut: boolean;

  role: JournalCaisseRole;
}

/*
 * Totaux financiers calculés
 * par le backend.
 *
 * Les Decimal Prisma sont reçus
 * sous forme de chaînes.
 */
export interface JournalCaisseTotals {
  nombrePaiements: number;

  montantTotalExigible: string;
  montantTotalRemis: string;
  monnaieTotaleRendue: string;
  montantTotalEncaisse: string;
}

/*
 * Demande associée à un paiement
 * du journal de caisse.
 */
export interface PaiementJournalDemande {
  id: string;
  numero: string;

  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  referenceFonciere: string;
}

/*
 * Paiement affiché dans le détail
 * d’un journal.
 */
export interface PaiementJournalCaisse {
  id: string;
  numeroRecu: string;

  montantExigible: string;
  montantRemis: string;
  monnaieRendue: string;
  montantEncaisse: string;

  modePaiement: "ESPECES";

  statut:
    | "PAYE"
    | "REMBOURSE";

  datePaiement: string;

  observations?:
    | string
    | null;

  demande:
    PaiementJournalDemande;
}

/*
 * Nombre de paiements associé
 * au journal.
 */
export interface JournalCaisseCount {
  paiements: number;
}

/*
 * Résumé d’un journal utilisé
 * dans la page de liste.
 */
export interface JournalCaisseResume {
  id: string;
  numero: string;

  dateJour: string;

  statut:
    StatutJournalCaisse;

  dateCloture?:
    | string
    | null;

  observations?:
    | string
    | null;

  caissierId: string;

  createdAt: string;
  updatedAt: string;

  caissier:
    JournalCaisseCaissier;

  _count:
    JournalCaisseCount;

  totals:
    JournalCaisseTotals;
}

/*
 * Détail complet d’un journal.
 */
export interface JournalCaisseDetail
  extends JournalCaisseResume {
  paiements:
    PaiementJournalCaisse[];
}

/*
 * Réponse paginée de la liste.
 */
export interface JournauxCaisseResponse {
  success: boolean;
  message: string;

  data:
    JournalCaisseResume[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/*
 * Réponse retournée lors de la clôture.
 *
 * Le backend retourne le résumé du journal,
 * sans nécessairement retourner immédiatement
 * la liste complète des paiements.
 */
export interface CloseJournalCaisseResponse {
  success: boolean;
  message: string;

  data: JournalCaisseResume;
}

/*
 * Réponse d’un journal unique.
 */
export interface JournalCaisseResponse {
  success: boolean;
  message: string;

  data:
    JournalCaisseDetail;
}

/*
 * Réponse du journal du jour.
 *
 * La route du jour ne retourne pas
 * encore la liste complète des paiements.
 */
export interface JournalCaisseDuJourResponse {
  success: boolean;
  message: string;

  data:
    JournalCaisseResume;
}

/*
 * Données envoyées lors de la clôture.
 */
export interface CloseJournalCaisseRequest {
  observations?: string;
}