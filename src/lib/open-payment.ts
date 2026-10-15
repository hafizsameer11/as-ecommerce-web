import { apiBaseUrl } from "@/lib/api/client";
import { accountApi } from "@/lib/api/account";

/** Open mock/Paystack checkout, then verify so the payment is recorded in DB. */
export async function openPaymentAndVerify(authorizationUrl: string, reference: string) {
  const url = authorizationUrl.startsWith("http")
    ? authorizationUrl
    : `${apiBaseUrl()}${authorizationUrl.startsWith("/") ? "" : "/"}${authorizationUrl}`;

  const popup = window.open(url, "asl_pay", "width=480,height=720");
  // Wait until the popup closes (user clicked Pay / Fail on mock page)
  await new Promise<void>((resolve) => {
    if (!popup) {
      // popup blocked — navigate same tab
      window.location.href = url;
      resolve();
      return;
    }
    const t = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(t);
        resolve();
      }
    }, 400);
  });

  try {
    await accountApi.verifyPayment(reference);
  } catch {
    // verify may race the webhook; list refresh still picks up the card
  }
}
