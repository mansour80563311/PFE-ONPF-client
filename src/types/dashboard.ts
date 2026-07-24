import type {
  StatutDemande,
} from "./demande";

export interface DashboardStatistiques {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesEnCours: number;
  demandesValidees: number;
  demandesRejetees: number;
  demandesCloturees: number;
  documentsNonConformes: number;
}

export interface DerniereDemande {
  id: string;
  numero: string;
  nomDemandeur: string;
  prenomDemandeur: string;
  cin: string;
  referenceFonciere: string;
  statut: StatutDemande;
  createdAt: string;
}

export interface ResponsableDashboard {
  id: string;
  nom: string;
  prenom: string;
  login: string;
}

export interface DernierJournalCloture {
  id: string;
  numero: string;
  dateJour: string;
  dateCloture: string;

  responsable: ResponsableDashboard;

  _count: {
    demandes: number;
  };
}

export interface DashboardData {
  statistiques: DashboardStatistiques;
  dernieresDemandes: DerniereDemande[];
  derniersJournaux: DernierJournalCloture[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}