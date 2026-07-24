import {
  useEffect,
  useState,
} from "react";

import dashboardService from "../services/dashboard.service";

import type {
  DashboardData,
} from "../types/dashboard";

export function useDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      try {
        const data =
          await dashboardService.getDashboard();

        if (active) {
          setDashboard(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError(
            "Impossible de charger les données du tableau de bord."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  return {
    dashboard,
    loading,
    error,
  };
}