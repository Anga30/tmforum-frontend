import { apiClient } from "@/lib/api-client";
import type { DashboardOverview } from "@/types/dashboard.types";

export const getDashboardOverview = (token: string): Promise<DashboardOverview> => apiClient("dashboard/overview", { headers: { Authorization: `Bearer ${token}` } });
