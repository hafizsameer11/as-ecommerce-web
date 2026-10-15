import { apiRequest } from "./client";

export type CustomerPreferences = {
  language?: string;
  currency?: string;
  privacy?: { analytics?: boolean; personalization?: boolean; marketingCookies?: boolean };
};

export type CustomerDto = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  phone?: string | null;
  phoneCountry?: string | null;
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "prefer_not_to_say" | null;
  avatarUrl?: string | null;
  tier?: string;
  status?: string;
  marketingOptIn?: boolean;
  hasOnboarded?: boolean;
  preferences?: CustomerPreferences;
  referralCode?: string | null;
  twoFactorEnabled?: boolean;
  createdAt?: string;
};

export type AuthSessionResponse = {
  accessToken: string;
  refreshToken: string;
  customer: CustomerDto;
  twoFactorRequired?: boolean;
  challenge?: string;
};

export type PublicSettings = Record<string, unknown>;

export type ApiSession = {
  id: string;
  device: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
  createdAt: string;
};

export const storeAuthApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthSessionResponse>("/store/auth/login", { method: "POST", body: { email, password } }),

  login2fa: (challenge: string, code: string) =>
    apiRequest<AuthSessionResponse>("/store/auth/login/2fa", {
      method: "POST",
      body: { challenge, code },
    }),

  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    apiRequest<AuthSessionResponse>("/store/auth/register", {
      method: "POST",
      body: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      },
    }),

  logout: () => apiRequest<{ signedOut: boolean }>("/store/auth/logout", { method: "POST" }),

  refresh: () =>
    apiRequest<{ accessToken: string; refreshToken: string }>("/store/auth/refresh", {
      method: "POST",
      body: {},
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ sent: boolean }>("/store/auth/password/forgot", { method: "POST", body: { email } }),

  me: () => apiRequest<CustomerDto>("/store/me"),

  updateProfile: (body: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    phoneCountry?: string | null;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "prefer_not_to_say" | null;
    marketingOptIn?: boolean;
  }) => apiRequest<CustomerDto>("/store/me", { method: "PATCH", body }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiRequest<CustomerDto>("/store/me/avatar", { method: "POST", rawBody: fd });
  },

  changePassword: (body: { currentPassword: string; newPassword: string; confirmPassword?: string }) =>
    apiRequest("/store/me/password", { method: "POST", body }),

  updatePreferences: (body: CustomerPreferences) =>
    apiRequest<CustomerDto>("/store/me/preferences", { method: "PATCH", body }),

  setup2fa: () =>
    apiRequest<{ secret: string; otpauthUrl: string }>("/store/me/2fa/setup", { method: "POST" }),

  enable2fa: (code: string) =>
    apiRequest<{ enabled: boolean; recoveryCodes: string[] }>("/store/me/2fa/enable", {
      method: "POST",
      body: { code },
    }),

  disable2fa: (code: string) =>
    apiRequest<{ enabled: boolean }>("/store/me/2fa/disable", { method: "POST", body: { code } }),

  sessions: () => apiRequest<ApiSession[]>("/store/me/sessions"),

  revokeSession: (id: string) =>
    apiRequest(`/store/me/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }),

  revokeOtherSessions: () => apiRequest("/store/me/sessions/revoke-others", { method: "POST" }),

  deleteAccount: (body: { confirm: "DELETE"; password?: string }) =>
    apiRequest("/store/me", { method: "DELETE", body }),

  completeOnboarding: () =>
    apiRequest<{ hasOnboarded: boolean }>("/store/me/onboarding/complete", { method: "POST" }),
};

export const storeSettingsApi = {
  public: () => apiRequest<PublicSettings>("/store/settings/public"),
};
