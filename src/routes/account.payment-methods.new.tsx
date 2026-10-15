import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { CreditCard, Building2, Wallet as WalletIcon } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { accountApi } from "@/lib/api/account";
import { openPaymentAndVerify } from "@/lib/open-payment";

export const Route = createFileRoute("/account/payment-methods/new")({
  head: () => ({
    meta: [
      { title: "Add Payment Method - ASL ORIGINALS" },
      { name: "description", content: "Add a new card via secure verification." },
    ],
  }),
  component: AddPaymentMethod,
});

function AddPaymentMethod() {
  const nav = useNavigate();
  const [type, setType] = useState<"card" | "bank" | "paypal">("card");
  const [isDefault, setIsDefault] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== "card") {
      toast.error(type === "bank" ? "Add bank accounts from Wallet → Withdraw" : "PayPal is not available yet");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const returnUrl = `${window.location.origin}/account/payment-methods`;
      const res = await accountApi.addPaymentMethod(returnUrl);
      if (res.authorizationUrl) {
        toast.success("Complete the ₦50 verification…");
        await openPaymentAndVerify(res.authorizationUrl, res.reference);
        if (isDefault) {
          const methods = await accountApi.paymentMethods();
          const newest = methods[0];
          if (newest && !newest.isDefault) {
            await accountApi.updatePaymentMethod(newest.id, { isDefault: true });
          }
        }
        toast.success("Payment method added");
        nav({ to: "/account/payment-methods" });
        return;
      }
      toast.success("Payment method added");
      nav({ to: "/account/payment-methods" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add card");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title="Add Payment Method"
        subtitle="Card numbers never touch our servers — verification is via the secure checkout page."
        activeId="payment-methods"
        backTo="/account/payment-methods"
      >
        <div className="rounded-2xl border border-border bg-white p-5 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {([{ v: "card" as const, l: "Card", I: CreditCard }, { v: "bank" as const, l: "Bank", I: Building2 }, { v: "paypal" as const, l: "PayPal", I: WalletIcon }]).map(
              ({ v, l, I }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setType(v)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-md border ${
                    type === v ? "bg-ink text-white border-ink" : "bg-white border-border"
                  }`}
                >
                  <I className="h-5 w-5" />
                  <span className="text-[12px] font-semibold">{l}</span>
                </button>
              ),
            )}
          </div>
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            {type === "card" && (
              <div className="rounded-md bg-muted/40 border border-border p-3">
                <div className="text-[13px] font-semibold">Secure card verification</div>
                <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                  You will complete a ₦50 authorization on the mock checkout page (Pay / Fail). The charge is refunded
                  automatically and the card is saved in the database.
                </p>
              </div>
            )}
            {type === "bank" && (
              <p className="text-[12px] text-muted-foreground">Bank accounts for withdrawals are managed under Wallet → Withdraw.</p>
            )}
            {type === "paypal" && <p className="text-[12px] text-muted-foreground">PayPal is not available yet.</p>}
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ink"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />{" "}
              Set as default
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => nav({ to: "/account/payment-methods" })}
                className="flex-1 h-11 rounded-md border border-border font-semibold text-[13px] hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[13px] hover:bg-ink/90 disabled:opacity-60"
              >
                {busy ? "Opening checkout…" : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
