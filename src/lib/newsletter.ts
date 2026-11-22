/**
 * Storefront newsletter signup → POST /store/marketing/newsletter
 * (known customers get marketingOptIn; guests become NewsletterLead).
 */
export type NewsletterResult = { status: "subscribed" };

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const { cmsApi } = await import("@/lib/api/cms");
  await cmsApi.subscribeNewsletter(email.trim().toLowerCase());
  clearPendingNewsletter();
  return { status: "subscribed" };
}

const PENDING_KEY = "asl-newsletter-pending";

export function clearPendingNewsletter() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** After sign-in: flush any legacy guest-pending key into marketingOptIn. */
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
    const { cmsApi } = await import("@/lib/api/cms");
    await cmsApi.subscribeNewsletter(pending);
    clearPendingNewsletter();
  } catch (err) {
    console.warn("[newsletter] opt-in after sign-in failed", err);
  }
}
