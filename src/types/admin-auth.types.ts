export type AdminAccountStatus = "PENDING_VERIFICATION" | "PENDING_EXECUTIVE_APPROVAL" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type AdminAccount = {
  id: string;
  partyId: string;
  email: string;
  role: "ADMIN";
  status: AdminAccountStatus;
  isExecutiveApprover: boolean;
  emailVerifiedAt: string | null;
};

export type AdminRegistrationInput = {
  givenName: string;
  middleName?: string;
  familyName: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  email: string;
  password: string;
};

export type AdminRegistrationResponse = { account: AdminAccount; partyId: string };
export type AdminLoginResponse = { accessToken: string; expiresAt: string; account: AdminAccount };
export type AdminIndividualProfile = {
  givenName: string;
  middleName: string | null;
  familyName: string;
  birthDate: string | null;
  gender: string | null;
  nationality: string | null;
  phone: string | null;
  address: string | null;
};
export type AdminSession = {
  account: AdminAccount;
  individual: AdminIndividualProfile;
  session: { id: string; adminAccountId: string; expiresAt: string; revokedAt: string | null; createdAt: string };
};
