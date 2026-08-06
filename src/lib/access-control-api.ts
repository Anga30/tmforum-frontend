import { apiClient } from "@/lib/api-client";
import type { Permission, PermissionCatalog, PermissionSet, Role } from "@/types/access-control.types";

const options = (token: string, method = "GET", body?: object): RequestInit => ({
  method,
  headers: { Authorization: `Bearer ${token}` },
  body: body ? JSON.stringify(body) : undefined,
});

export const listPermissions = (token: string): Promise<Permission[]> => apiClient("access-control/permissions", options(token));
export const getPermissionCatalog = (token: string): Promise<PermissionCatalog> => apiClient("access-control/permissions/options", options(token));
export const createPermission = (input: object, token: string): Promise<Permission> => apiClient("access-control/permissions", options(token, "POST", input));
export const updatePermission = (id: string, input: object, token: string): Promise<Permission> => apiClient(`access-control/permissions/${id}`, options(token, "PATCH", input));
export const deletePermission = (id: string, reason: string, token: string): Promise<void> => apiClient(`access-control/permissions/${id}`, options(token, "DELETE", { reason }));
export const listPermissionSets = (token: string): Promise<PermissionSet[]> => apiClient("access-control/permission-sets", options(token));
export const createPermissionSet = (input: object, token: string): Promise<PermissionSet> => apiClient("access-control/permission-sets", options(token, "POST", input));
export const updatePermissionSet = (id: string, input: object, token: string): Promise<PermissionSet> => apiClient(`access-control/permission-sets/${id}`, options(token, "PATCH", input));
export const deletePermissionSet = (id: string, reason: string, token: string): Promise<void> => apiClient(`access-control/permission-sets/${id}`, options(token, "DELETE", { reason }));
export const listRoles = (token: string): Promise<Role[]> => apiClient("access-control/roles", options(token));
export const createRole = (input: object, token: string): Promise<Role> => apiClient("access-control/roles", options(token, "POST", input));
export const updateRole = (id: string, input: object, token: string): Promise<Role> => apiClient(`access-control/roles/${id}`, options(token, "PATCH", input));
export const deleteRole = (id: string, reason: string, token: string): Promise<void> => apiClient(`access-control/roles/${id}`, options(token, "DELETE", { reason }));
