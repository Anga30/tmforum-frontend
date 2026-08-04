const accessTokenKey = "tmforum.admin.access-token";
export const saveAccessToken = (accessToken: string): void => window.sessionStorage.setItem(accessTokenKey, accessToken);
export const getAccessToken = (): string | null => typeof window === "undefined" ? null : window.sessionStorage.getItem(accessTokenKey);
export const clearAccessToken = (): void => window.sessionStorage.removeItem(accessTokenKey);
