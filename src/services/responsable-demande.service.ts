import api from "../api/axios";

import type {
  CorrigerDemandeResponsableRequest,
  CorrectionResponsableData,
  CorrectionResponsableResponse,
} from "../types/responsable-demande";


class ResponsableDemandeService {
  /**
   * Corrige les informations métier d'une inscription déjà
   * payée et transmise au Responsable Guichet.
   *
   * La tarification initiale reste figée côté backend ; le
   * résultat contient une nouvelle RevisionDemande et, si
   * nécessaire, le complément à payer.
   */
  async corrigerInscription(
    demandeId: string,
    data:
      CorrigerDemandeResponsableRequest
  ): Promise<CorrectionResponsableData> {
    const response =
      await api.patch<CorrectionResponsableResponse>(
        `/demandes/${demandeId}/controle/correction`,
        data
      );

    return response.data.data;
  }
}


export default new ResponsableDemandeService();
