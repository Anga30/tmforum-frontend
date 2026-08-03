import type { ApiErrorResponse } from "@/types/api.types";

export class ApiError extends Error {
  public constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export const apiClient = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api/${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (!response.ok) {
    const body = await response.json().catch((): ApiErrorResponse => ({}));
    throw new ApiError(body.message ?? "The request could not be completed.", response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
