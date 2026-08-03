import { apiClient } from "@/lib/api-client";
import type { AdminLoginResponse, AdminRegistrationInput, AdminRegistrationResponse, AdminSession } from "@/types/admin-auth.types";

export const registerAdmin = (input: AdminRegistrationInput): Promise<AdminRegistrationResponse> => apiClient("auth/admin/register", { method: "POST", body: JSON.stringify(input) });
export const verifyAdminEmail = (token: string): Promise<AdminRegistrationResponse> => apiClient("auth/admin/verify-email", { method: "POST", body: JSON.stringify({ token }) });
export const approveAdminRegistration = (token: string): Promise<AdminRegistrationResponse> => apiClient("auth/admin/approve-registration", { method: "POST", body: JSON.stringify({ token }) });
export const loginAdmin = (email: string, password: string): Promise<AdminLoginResponse> => apiClient("auth/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const getCurrentAdmin = (accessToken: string): Promise<AdminSession> => apiClient("auth/admin/me", { headers: { Authorization: `Bearer ${accessToken}` } });
export const logoutAdmin = (accessToken: string): Promise<void> => apiClient("auth/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
