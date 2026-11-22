export const COOKIE_CONSENT_KEY = "asl-cookie-consent";

export type CookieConsent = {
  essential: true;
  performance: boolean;
  functional: boolean;
  advertising: boolean;
  savedAt: string;
};

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<CookieConsent>;
    if (parsed.essential !== true || typeof parsed.savedAt !== "string") return null;
    return {
      essential: true,
      performance: parsed.performance === true,
      functional: parsed.functional === true,
      advertising: parsed.advertising === true,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: Omit<CookieConsent, "essential" | "savedAt">) {
  if (typeof window === "undefined") return;
  const consent: CookieConsent = {
    essential: true,
    ...preferences,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("asl:cookie-consent-updated", { detail: consent }));
  void postCookieConsentToServer(preferences);
  void syncCookieConsentToAccount(preferences);
}

const ANON_ID_KEY = "asl-anon-id";

function anonId(): string {
  try {
    let id = window.localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(ANON_ID_KEY, id);
    }
    return id.slice(0, 64);
  } catch {
    return `anon_${Date.now()}`;
  }
}

/** Record consent choices for compliance (server links to the customer when signed in). */
export async function postCookieConsentToServer(
  preferences: Omit<CookieConsent, "essential" | "savedAt">
) {
  try {
    const { appConfigStoreApi } = await import("@/lib/api/platform");
    await appConfigStoreApi.saveConsent({
      anonId: anonId(),
      choices: {
        performance: preferences.performance,
        functional: preferences.functional,
        advertising: preferences.advertising,
      },
    });
  } catch (err) {
    console.warn("[cookie-consent] POST /store/app/consent failed", err);
  }
}

/** When signed in, mirror cookie choices onto customer privacy preferences. */
export async function syncCookieConsentToAccount(
  preferences: Omit<CookieConsent, "essential" | "savedAt">
) {
  try {
    const { useAuth } = await import("@/lib/auth-store");
    if (!useAuth.getState().isLoggedIn) return;
    const { storeAuthApi } = await import("@/lib/api/auth");
    await storeAuthApi.updatePreferences({
      privacy: {
        analytics: preferences.performance,
        personalization: preferences.functional,
        marketingCookies: preferences.advertising,
      },
    });
  } catch (err) {
    console.warn("[cookie-consent] sync preferences failed", err);
  }
}