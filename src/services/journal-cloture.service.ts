import api from "../api/axios";

import type {
  CreateJournalClotureRequest,
  JournalCloture,
  JournalClotureResponse,
  JournauxClotureResponse,
  PaginatedJournauxCloture,
  PreviewClotureResponse,
  DemandeCloture,
} from "../types/journal-cloture";

const journalClotureService = {
  async getJournaux(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedJournauxCloture> {
    const response =
      await api.get<JournauxClotureResponse>(
        "/journaux-cloture",
        {
          params: {
            page,
            limit,
            search,
          },
        }
      );

    return {
      journaux: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages:
        response.data.meta.totalPages,
    };
  },

  async getJournal(
    id: string
  ): Promise<JournalCloture> {
    const response =
      await api.get<JournalClotureResponse>(
        `/journaux-cloture/${id}`
      );

    return response.data.data;
  },

  async preview(
    dateJour: string
  ): Promise<DemandeCloture[]> {
    const response =
      await api.get<PreviewClotureResponse>(
        "/journaux-cloture/preview",
        {
          params: {
            dateJour,
          },
        }
      );

    return response.data.data;
  },

  async create(
    data: CreateJournalClotureRequest
  ): Promise<JournalCloture> {
    const response =
      await api.post<JournalClotureResponse>(
        "/journaux-cloture",
        data
      );

    return response.data.data;
  },
};

export default journalClotureService;