import api from "../api/axios";

import type {
  IdentiteCni,
  VerifierCniRequest,
  VerifierCniResponse,
} from "../types/cni";

class CniService {
  async verifierCni(
    data: VerifierCniRequest
  ): Promise<IdentiteCni> {
    const response =
      await api.post<VerifierCniResponse>(
        "/cni/verifier",
        data
      );

    return response.data.data;
  }
}

export default new CniService();