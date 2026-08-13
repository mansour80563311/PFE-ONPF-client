import api from "../api/axios";

import {
  NatureDemande,
} from "../types/demande";

import type {
  LanguePrestation,
  TypeLigneTarification,
} from "../types/demande";


/**
 * ============================================================
 * REQUETE DE CALCUL — INSCRIPTION
 * ============================================================
 */
export interface CalculTarificationInscriptionRequest {
  nature:
    typeof NatureDemande.INSCRIPTION;

  operationFonciereIds:
    string[];
}


/**
 * ============================================================
 * REQUETE DE CALCUL — PRESTATION
 * ============================================================
 */
export interface CalculTarificationPrestationRequest {
  nature:
    typeof NatureDemande.PRESTATION;

  prestationId:
    string;

  nombrePages?:
    number;

  langue:
    LanguePrestation;
}


/**
 * Requête acceptée par :
 *
 * POST /api/tarification/calculer
 */
export type CalculTarificationRequest =
  | CalculTarificationInscriptionRequest
  | CalculTarificationPrestationRequest;


/**
 * ============================================================
 * LIGNE DE CALCUL
 * ============================================================
 *
 * Contrairement à LigneTarification de Demande,
 * ces lignes ne sont pas encore persistées.
 *
 * Elles n'ont donc pas encore :
 *
 * - id ;
 * - tarificationId ;
 * - createdAt.
 */
export interface LigneCalculTarification {
  type:
    TypeLigneTarification;

  code: string;

  libelle: string;

  quantite: number;

  montantUnitaire: string;

  montant: string;

  ordre: number;
}


/**
 * ============================================================
 * RESULTAT DU CALCUL
 * ============================================================
 */
export interface CalculTarification {
  nature:
    typeof NatureDemande.INSCRIPTION
    | typeof NatureDemande.PRESTATION;

  /**
   * Présents principalement pour les prestations.
   */
  prestationCode?:
    string | null;

  prestationLibelle?:
    string | null;

  langue?:
    LanguePrestation | null;

  nombrePages?:
    number | null;

  /**
   * Decimal Prisma transmis en JSON.
   */
  montantTotal:
    string;

  referenceReglementaire?:
    string | null;

  lignes:
    LigneCalculTarification[];
}


/**
 * Réponse standard de l'API.
 */
interface CalculTarificationResponse {
  success: boolean;

  message: string;

  data:
    CalculTarification;
}


class TarificationService {
  /**
   * ==========================================================
   * CALCUL TARIFAIRE
   * ==========================================================
   *
   * Le calcul est uniquement une simulation.
   *
   * Aucune demande et aucune tarification
   * ne sont enregistrées par cet endpoint.
   *
   * La tarification définitive sera de nouveau
   * calculée et enregistrée par le backend
   * lors de POST /api/demandes.
   */
  async calculer(
    data: CalculTarificationRequest
  ): Promise<CalculTarification> {
    const response =
      await api.post<
        CalculTarificationResponse
      >(
        "/tarification/calculer",
        data
      );

    return response.data.data;
  }
}


export default new TarificationService();