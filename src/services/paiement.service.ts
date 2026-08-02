import api from "../api/axios";

import type {
  CreatePaiementRequest,
  Paiement,
  PaiementResponse,
} from "../types/paiement";

class PaiementService {
  /**
   * Enregistre le paiement d’une demande.
   *
   * Accessible au Caissier et à
   * l’Administrateur.
   */
  async createPaiement(
    demandeId: string,
    data: CreatePaiementRequest
  ): Promise<Paiement> {
    const response =
      await api.post<PaiementResponse>(
        `/demandes/${demandeId}/paiement`,
        data
      );

    return response.data.data;
  }

  /**
   * Récupère le paiement associé
   * à une demande.
   */
  async getByDemandeId(
    demandeId: string
  ): Promise<Paiement> {
    const response =
      await api.get<PaiementResponse>(
        `/demandes/${demandeId}/paiement`
      );

    return response.data.data;
  }

  /**
   * Récupère directement un paiement
   * à partir de son identifiant.
   */
  async getById(
    paiementId: string
  ): Promise<Paiement> {
    const response =
      await api.get<PaiementResponse>(
        `/paiements/${paiementId}`
      );

    return response.data.data;
  }
}

export default new PaiementService();