import api from "../api/axios";

import type {
  CreatePaiementComplementaireData,
  CreatePaiementComplementaireRequest,
  CreatePaiementComplementaireResponse,
  EtatPaiementComplementaireData,
  EtatPaiementComplementaireResponse,
} from "../types/paiement-complementaire";


class PaiementComplementaireService {
  /**
   * Récupère l'état de la dernière régularisation tarifaire
   * d'une demande.
   *
   * Le backend peut retourner revision = null lorsqu'aucune
   * correction Responsable n'a encore été enregistrée.
   */
  async getEtatByDemandeId(
    demandeId: string
  ): Promise<EtatPaiementComplementaireData> {
    const response =
      await api.get<EtatPaiementComplementaireResponse>(
        `/demandes/${demandeId}/paiement-complementaire`
      );

    return response.data.data;
  }


  /**
   * Enregistre uniquement le complément exigible de la dernière
   * révision au statut COMPLEMENT_A_PAYER.
   *
   * Accessible au Caissier et à l'Administrateur côté backend.
   */
  async create(
    demandeId: string,
    data:
      CreatePaiementComplementaireRequest
  ): Promise<CreatePaiementComplementaireData> {
    const response =
      await api.post<CreatePaiementComplementaireResponse>(
        `/demandes/${demandeId}/paiement-complementaire`,
        data
      );

    return response.data.data;
  }
}


export default new PaiementComplementaireService();
