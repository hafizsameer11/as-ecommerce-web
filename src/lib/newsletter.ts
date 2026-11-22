const PENDING_KEY = "asl-newsletter-pending";

export type NewsletterResult = { status: "subscribed" } | { status: "pending" };

/**
 * The API has no public newsletter-subscribe endpoint, so:
 * - signed in  → real call: PATCH /store/me { marketingOptIn: true }
 * - guest      → remember the email locally and opt the account in on next sign-in / sign-up
 */
export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const { useAuth } = await import("@/lib/auth-store");
  if (useAuth.getState().isLoggedIn) {
    const { storeAuthApi } = await import("@/lib/api/auth");
    await storeAuthApi.updateProfile({ marketingOptIn: true });
    clearPendingNewsletter();
    return { status: "subscribed" };
  }
  try {
    window.localStorage.setItem(PENDING_KEY, email.trim().toLowerCase());
  } catch {
    /* storage unavailable */
  }
  return { status: "pending" };
}

export function clearPendingNewsletter() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** After sign-in: if the guest asked for newsletters, opt the account in. */
export async function flushPendingNewsletter() {
  if (typeof window === "undefined") return;
  let pending: string | null = null;
  try {
    pending = window.localStorage.getItem(PENDING_KEY);
  } catch {
    return;
  }
  if (!pending) return;
  try {
    const { storeAuthApi } = await import("@/lib/api/auth");
    await storeAuthApi.updateProfile({ marketingOptIn: true });
    clearPendingNewsletter();
  } catch (err) {
    console.warn("[newsletter] opt-in after sign-in failed", err);
  }
}
