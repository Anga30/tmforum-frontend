export type DashboardOverview = {
  summary: { totalParties: number; activeParties: number; organizations: number; activeOrganizations: number; individuals: number; activeIndividuals: number; permissionSets: number; permissions: number };
  activity: { id: string; action: string; target: string; actor: string; reason?: string | null; occurredAt: string }[];
  permissionSets: { id: string; name: string; permissionCount: number; partyCount: number }[];
  parties: { id: string; name: string; partyType: "INDIVIDUAL" | "ORGANIZATION"; status: string; createdAt: string; roleCount: number }[];
};
