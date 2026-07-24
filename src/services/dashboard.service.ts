import api from "../api/axios";

import type {
  DashboardData,
  DashboardResponse,
} from "../types/dashboard";

const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response =
      await api.get<DashboardResponse>(
        "/dashboard"
      );

    return response.data.data;
  },
};

export default dashboardService;