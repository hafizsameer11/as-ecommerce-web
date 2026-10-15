import { apiBaseUrl } from "@/lib/api/client";
import { accountApi } from "@/lib/api/account";
import { openPaymentAndVerify } from "@/lib/open-payment";

export async function downloadOrderInvoice(apiId: string, filename: string) {
  const url = `${apiBaseUrl()}/api/v1/store/me/orders/${encodeURIComponent(apiId)}/invoice.pdf`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      msg = j?.error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg || "Could not download invoice");
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export async function payOrderAgain(apiId: string, returnPath: string) {
  const returnUrl = `${window.location.origin}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`;
  const res = await accountApi.payOrder(apiId, returnUrl);
  if (res.authorizationUrl && res.reference) {
    await openPaymentAndVerify(res.authorizationUrl, res.reference);
  }
  return res;
}
