import api from "../api/axios";

import type {
  Demande,
  DemandeResponse,
  CreateDemandeRequest,
  UpdateDemandeRequest,
  UpdateDemandeStatusRequest,
  PaginatedDemandes,
  HistoriqueStatutDemande,
  HistoriqueDemandeResponse,
} from "../types/demande";

class DemandeService {
  async getDemandes(
    page = 1,
    limit = 10,
    search = ""
  ) {
    const response =
      await api.get<PaginatedDemandes>(
        `/demandes?page=${page}&limit=${limit}&search=${search}`
      );

    return response.data;
  }

  async getDemande(id: string) {
    const response =
      await api.get<DemandeResponse>(
        `/demandes/${id}`
      );

    return response.data;
  }

  async createDemande(
    data: CreateDemandeRequest
  ) {
    const response = await api.post<
      DemandeResponse
    >("/demandes", data);

    return response.data;
  }

  async updateDemande(
    id: string,
    data: UpdateDemandeRequest
  ) {
    const response = await api.put<
      DemandeResponse
    >(`/demandes/${id}`, data);

    return response.data;
  }

  async updateStatus(
    id: string,
    data: UpdateDemandeStatusRequest
  ): Promise<Demande> {
    const response = await api.patch<DemandeResponse>(
      `/demandes/${id}/status`,
      data
    );

    return response.data.data;
  }

  async getHistory(
  id: string
): Promise<HistoriqueStatutDemande[]> {
  const response =
    await api.get<HistoriqueDemandeResponse>(
      `/demandes/${id}/history`
    );

  return response.data.data;
}

  async deleteDemande(id: string) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/demandes/${id}`);

    return response.data;
  }
}

export default new DemandeService();