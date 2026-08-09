import api from "../api/axios";

import type {
  CloseJournalCaisseRequest,
  CloseJournalCaisseResponse,
  JournalCaisseDetail,
  JournalCaisseResume,
  JournalCaisseResponse,
  JournalCaisseDuJourResponse,
  JournauxCaisseResponse,
} from "../types/journal-caisse";
const journalCaisseService = {
  /**
   * Liste paginée des journaux.
   *
   * CAISSIER :
   * le backend retourne uniquement
   * ses propres journaux.
   *
   * ADMIN et RESPONSABLE :
   * le backend retourne tous
   * les journaux.
   */
  async getAll(
    page = 1,
    limit = 10
  ): Promise<JournauxCaisseResponse> {
    const response =
      await api.get<JournauxCaisseResponse>(
        "/journaux-caisse",
        {
          params: {
            page,
            limit,
          },
        }
      );

    return response.data;
  },

  /**
   * Récupère le journal du jour.
   *
   * Pour un Caissier, aucun identifiant
   * supplémentaire n’est nécessaire.
   *
   * Pour un Administrateur ou un Responsable,
   * caissierId doit être fourni.
   */
  async getJournalDuJour(
    caissierId?: string
  ): Promise<JournalCaisseResume> {
    const response =
      await api.get<JournalCaisseDuJourResponse>(
        "/journaux-caisse/du-jour",
        {
          params:
            caissierId
              ? {
                  caissierId,
                }
              : undefined,
        }
      );

    return response.data.data;
  },

  /**
   * Récupère le détail complet
   * d’un journal avec ses paiements.
   */
  async getById(
    journalId: string
  ): Promise<JournalCaisseDetail> {
    const response =
      await api.get<JournalCaisseResponse>(
        `/journaux-caisse/${journalId}`
      );

    return response.data.data;
  },

    /**
     * Clôture un journal de caisse.
     *
     * Après la clôture, la page de détail
     * recharge le journal pour récupérer
     * toutes les informations actualisées.
     */
    async close(
        journalId: string,
        data: CloseJournalCaisseRequest
        ): Promise<JournalCaisseResume> {
        const response =
            await api.patch<CloseJournalCaisseResponse>(
            `/journaux-caisse/${journalId}/cloturer`,
            data
            );

        return response.data.data;
    },
    /**
     * Récupère le reçu PDF d’un paiement.
     *
     * L’authentification JWT est automatiquement
     * envoyée par l’instance Axios.
     */
    async getRecuPdf(
        paiementId: string
        ): Promise<Blob> {
        const response =
            await api.get<Blob>(
            `/paiements/${paiementId}/recu`,
            {
                responseType: "blob",
            }
            );

        return response.data;
    },
};

export default journalCaisseService;