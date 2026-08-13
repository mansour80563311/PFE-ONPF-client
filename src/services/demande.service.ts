import api from "../api/axios";

import type {
  Demande,
  DemandeResponse,
  CreateDemandeRequest,
  UpdateDemandeRequest,
  UpdateDemandeStatusRequest,
  PaginatedDemandes,
  HistoriqueStatutDemande,
} from "../types/demande";


class DemandeService {
  /**
   * ==========================================================
   * LISTE DES DEMANDES
   * ==========================================================
   */
  async getDemandes(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedDemandes> {
    const response =
      await api.get<PaginatedDemandes>(
        "/demandes",
        {
          params: {
            page,
            limit,
            search,
          },
        }
      );

    return response.data;
  }


  /**
   * ==========================================================
   * DETAIL D'UNE DEMANDE
   * ==========================================================
   */
  async getDemande(
    id: string
  ): Promise<DemandeResponse> {
    const response =
      await api.get<DemandeResponse>(
        `/demandes/${id}`
      );

    return response.data;
  }


  /**
   * ==========================================================
   * CREATION
   * ==========================================================
   *
   * CreateDemandeRequest est maintenant une union :
   *
   * - INSCRIPTION
   * - PRESTATION
   */
  async createDemande(
    data: CreateDemandeRequest
  ): Promise<DemandeResponse> {
    const response =
      await api.post<DemandeResponse>(
        "/demandes",
        data
      );

    return response.data;
  }


  /**
   * ==========================================================
   * MODIFICATION
   * ==========================================================
   */
  async updateDemande(
    id: string,
    data: UpdateDemandeRequest
  ): Promise<DemandeResponse> {
    const response =
      await api.put<DemandeResponse>(
        `/demandes/${id}`,
        data
      );

    return response.data;
  }


  /**
   * ==========================================================
   * CHANGEMENT DE STATUT
   * ==========================================================
   */
  async updateStatus(
    id: string,
    data: UpdateDemandeStatusRequest
  ): Promise<Demande> {
    const response =
      await api.patch<DemandeResponse>(
        `/demandes/${id}/status`,
        data
      );

    return response.data.data;
  }


  /**
   * ==========================================================
   * HISTORIQUE
   * ==========================================================
   */
  async getHistory(
    id: string
  ): Promise<HistoriqueStatutDemande[]> {
    const response =
      await api.get<{
        success: boolean;
        message: string;
        data: HistoriqueStatutDemande[];
      }>(
        `/demandes/${id}/history`
      );

    return response.data.data;
  }


  /**
   * ==========================================================
   * VERIFICATION CNI
   * ==========================================================
   */
  async verifierCni(
    id: string
  ): Promise<Demande> {
    const response =
      await api.patch<DemandeResponse>(
        `/demandes/${id}/verifier-cni`
      );

    return response.data.data;
  }


  /**
   * ==========================================================
   * SUPPRESSION
   * ==========================================================
   */
  async deleteDemande(
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response =
      await api.delete<{
        success: boolean;
        message: string;
      }>(
        `/demandes/${id}`
      );

    return response.data;
  }
}


export default new DemandeService();