import type { User } from "./user";

export const StatutDemande = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_COURS: "EN_COURS",
  VALIDEE: "VALIDEE",
  REJETEE: "REJETEE",
} as const;

export type StatutDemande =
  (typeof StatutDemande)[keyof typeof StatutDemande];

export interface Demande {
  id: string;
  numero: string;

  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;

  telephone: string;
  email?: string;

  referenceFonciere: string;
  adresseBien: string;

  statut: StatutDemande;

  observations?: string;
  utilisateur: User;

  motifRejet?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDemandeRequest {
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
  ancienStatut: StatutDemande;
  nouveauStatut: StatutDemande;
  motif?: string | null;
  demandeId: string;
  utilisateurId: string;
  createdAt: string;
  utilisateur: HistoriqueUtilisateur;
}

export interface HistoriqueDemandeResponse {
  success: boolean;
  message: string;
  data: HistoriqueStatutDemande[];
}