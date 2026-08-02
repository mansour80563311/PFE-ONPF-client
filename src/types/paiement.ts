/*
 * Mode de paiement actuellement accepté.
 */
export const ModePaiement = {
  ESPECES: "ESPECES",
} as const;

export type ModePaiement =
  (typeof ModePaiement)[keyof typeof ModePaiement];

/*
 * Statuts possibles d’un paiement.
 */
export const StatutPaiement = {
  PAYE: "PAYE",
  REMBOURSE: "REMBOURSE",
} as const;

export type StatutPaiement =
  (typeof StatutPaiement)[keyof typeof StatutPaiement];

export interface PaiementRole {
  id: string;
  nom: string;
}

export interface PaiementCaissier {
  id: string;
  nom: string;
  prenom: string;
  login: string;
  role: PaiementRole;
}

export interface PaiementDemande {
  id: string;
  numero: string;

  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  telephone?: string;
  email?: string | null;

  referenceFonciere: string;
  adresseBien?: string;

  nombreExemplaires: number;
  langueCertificat: string;
  traductionDemandee: boolean;

  prixUnitaire: string;
  supplementTraduction: string;
  montantTotal: string;

  statut: string;
}

export interface Paiement {
  id: string;
  numeroRecu: string;

  montantExigible: string;
  montantRemis: string;
  monnaieRendue: string;
  montantEncaisse: string;

  modePaiement: ModePaiement;
  statut: StatutPaiement;

  montantEnLettres?: string | null;
  observations?: string | null;

  datePaiement: string;

  demandeId: string;
  caissierId: string;

  createdAt: string;
  updatedAt: string;

  caissier: PaiementCaissier;
  demande: PaiementDemande;
}

export interface CreatePaiementRequest {
  /*
   * Le montant est envoyé sous forme de chaîne
   * afin de préserver les trois décimales du
   * dinar tunisien.
   */
  montantRemis: string;
  observations?: string;
}

export interface PaiementResponse {
  success: boolean;
  message: string;
  data: Paiement;
}