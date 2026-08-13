import api from "../api/axios";

import type {
  Gouvernorat,
  TypeOperationFonciere,
  Prestation,
} from "../types/demande";


interface ApiListResponse<T> {
  success: boolean;

  message: string;

  data: T[];
}


class ReferentielService {
  /**
   * ==========================================================
   * GOUVERNORATS
   * ==========================================================
   *
   * GET /api/referentiels/gouvernorats
   */
  async getGouvernorats():
    Promise<Gouvernorat[]> {
    const response =
      await api.get<
        ApiListResponse<Gouvernorat>
      >(
        "/referentiels/gouvernorats"
      );

    return response.data.data;
  }


  /**
   * ==========================================================
   * OPERATIONS FONCIERES
   * ==========================================================
   *
   * GET /api/referentiels/operations-foncieres
   */
  async getOperationsFoncieres():
    Promise<TypeOperationFonciere[]> {
    const response =
      await api.get<
        ApiListResponse<TypeOperationFonciere>
      >(
        "/referentiels/operations-foncieres"
      );

    return response.data.data;
  }


  /**
   * ==========================================================
   * PRESTATIONS
   * ==========================================================
   *
   * GET /api/referentiels/prestations
   */
  async getPrestations():
    Promise<Prestation[]> {
    const response =
      await api.get<
        ApiListResponse<Prestation>
      >(
        "/referentiels/prestations"
      );

    return response.data.data;
  }
}


export default new ReferentielService();