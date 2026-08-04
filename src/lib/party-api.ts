import { apiClient } from "@/lib/api-client";
import type { Party, PartyInput, PartyRoleData, PartyType } from "@/types/party.types";

const options = (token: string, method = "GET", body?: object): RequestInit => ({ method, headers: { Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
export const listParties = (type: PartyType, token: string): Promise<Party[]> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}`, options(token));
export const createParty = (type: PartyType, input: PartyInput, token: string): Promise<Party> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}`, options(token, "POST", input));
export const verifyPartyEmail = (token: string): Promise<Party> => apiClient("party-management/verify-email", { method: "POST", body: JSON.stringify({ token }) });
export const getParty = (type: PartyType, id: string, token: string): Promise<Party> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}`, options(token));
export const updateParty = (type: PartyType, id: string, input: object, token: string): Promise<Party> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}`, options(token, "PATCH", input));
export const suspendParty = (type: PartyType, id: string, reason: string, token: string): Promise<Party> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}/suspend`, options(token, "POST", { reason }));
export const unsuspendParty = (type: PartyType, id: string, reason: string, token: string): Promise<Party> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}/unsuspend`, options(token, "POST", { reason }));
export const deleteParty = (type: PartyType, id: string, reason: string, token: string): Promise<void> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}`, options(token, "DELETE", { reason }));
export const getPartyRoles = (type: PartyType, id: string, token: string): Promise<PartyRoleData> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}/roles`, options(token));
export const assignPartyRole = (type: PartyType, id: string, roleId: string, token: string): Promise<PartyRoleData> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}/roles`, options(token, "POST", { roleId }));
export const revokePartyRole = (type: PartyType, id: string, assignmentId: string, reason: string, token: string): Promise<PartyRoleData> => apiClient(`party-management/${type === "INDIVIDUAL" ? "individual" : "organization"}/${id}/roles/${assignmentId}/revoke`, options(token, "POST", { reason }));
