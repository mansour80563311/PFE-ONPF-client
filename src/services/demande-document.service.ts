import api from "../api/axios";

import type {
  DemandeDocument,
  DemandeDocumentResponse,
  DemandeDocumentsResponse,
  StatutDocument,
  TypeDocument,
} from "../types/demande-document";

const demandeDocumentService = {
  async getDocuments(
    demandeId: string
  ): Promise<DemandeDocument[]> {
    const response =
      await api.get<DemandeDocumentsResponse>(
        `/demandes/${demandeId}/documents`
      );

    return response.data.data;
  },

  async uploadDocument(
    demandeId: string,
    type: TypeDocument,
    file: File
  ): Promise<DemandeDocument> {
    const formData = new FormData();

    formData.append("type", type);
    formData.append("document", file);

    const response =
      await api.post<DemandeDocumentResponse>(
        `/demandes/${demandeId}/documents`,
        formData
      );

    return response.data.data;
  },

  async updateStatus(
    demandeId: string,
    documentId: string,
    statut: StatutDocument,
    motifNonConformite?: string
  ): Promise<DemandeDocument> {
    const response =
      await api.patch<DemandeDocumentResponse>(
        `/demandes/${demandeId}/documents/${documentId}/status`,
        {
          statut,
          ...(motifNonConformite && {
            motifNonConformite,
          }),
        }
      );

    return response.data.data;
  },

  async deleteDocument(
    demandeId: string,
    documentId: string
  ): Promise<void> {
    await api.delete(
      `/demandes/${demandeId}/documents/${documentId}`
    );
  },

  async downloadDocument(
    demandeId: string,
    documentId: string
  ): Promise<Blob> {
    const response = await api.get<Blob>(
      `/demandes/${demandeId}/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};

export default demandeDocumentService;