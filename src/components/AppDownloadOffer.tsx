import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import offerImage from "@/assets/hero-sneakers.jpg";
import { toast } from "sonner";
import { useAppDownloadOffer } from "@/hooks/use-app-download-offer";
import { useAppDownload } from "@/lib/app-download-store";
import { useMyCoupons } from "@/lib/my-coupons-store";
import { useCheckout } from "@/lib/checkout-store";
import { useCartCount } from "@/lib/cart-store";

const APP_STORE_URL = "#";
const PLAY_STORE_URL = "#";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path fill="#00D2FF" d="M50.4 9.2c-6.9 7.2-11.4 17.2-11.4 28.8v436c0 11.6 4.5 21.6 11.4 28.8l1.6 1.6L296.2 260.2v-8.4L52 7.6z" />
      <path fill="#FFCE00" d="m393.3 162.9-97.2 88.9v8.4l97.2 88.9 1.9-1.1 114.9-65.3c32.8-18.7 32.8-49.2 0-67.9l-114.9-65.3z" />
      <path fill="#FF3A44" d="M395.2 350.1 296.2 260.2 50.4 502.8c8.3 8.8 22 12.4 37.4 4.2z" />
      <path fill="#00F076" d="M395.2 161.9 87.8 5.1C72.4-3.1 58.7 0.5 50.4 9.2L296.2 251.8z" />
    </svg>
  );
}

export function AppDownloadOffer() {
  const { mounted, open, close, claim, markInstalled, offer, claimResult } = useAppDownloadOffer();
  const claimOffer = useAppDownload((s) => s.claim);
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const addCoupon = useMyCoupons((s) => s.add);
  const applyCoupon = useCheckout((s) => s.applyCoupon);
  const cartCount = useCartCount();

  const pct = claimResult?.pct ?? offer?.percent ?? 10;
  const couponCode = claimResult?.code ?? "APP10";
  const rewardLabel = claimResult?.label ?? offer?.label ?? "App Download Reward";

  if (!mounted || !open) return null;

  const handleDownload = (url: string) => {
    markInstalled();
    setUnlocked(true);
    void claimOffer().then((result) => {
      const code = result?.code ?? couponCode;
      const discount = result?.pct ?? pct;
      const label = result?.label ?? rewardLabel;
      addCoupon({ code, pct: discount, label, source: "promo" });
      if (cartCount > 0) {
        void Promise.resolve(applyCoupon(code)).then((res) => {
          if (res.ok) toast.success(`${code} applied — ${discount}% off`);
          else toast.success(`Coupon ${code} saved to your account`);
        });
      } else {
        toast.success(`Coupon ${code} saved to your account`);
      }
    });
    if (url && url !== "#") window.open(url, "_blank", "noopener");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-lg bg-background text-foreground shadow-2xl"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-2.5 top-2.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-paper transition-colors hover:bg-ink"
            >
              <X className="h-4 w-4" />
            </button>

            <img src={offerImage} alt="Luxury footwear available in the ASL ORIGINALS app" className="h-32 w-full object-cover" />

            <div className="p-4">
            <div className="mb-2 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-4 bg-gold/70" />
              App Exclusive
            </div>

            <h2 className="font-display text-[19px] font-bold uppercase leading-tight text-foreground">
              {pct}% off your first app order
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Download the <span className="font-semibold text-foreground">ASL ORIGINALS</span> app and enjoy {pct}% off your first app order. Limit one use per customer.
            </p>

            <div className="mt-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-ink text-paper">
                    <span className="font-display text-[11px] font-bold">{pct}%</span>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Your code</div>
                    <div className="font-display text-[15px] font-bold tracking-wide text-foreground">{couponCode}</div>
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-foreground" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              {!unlocked && (
                <div className="mt-2 border-t border-border pt-2 text-[9.5px] text-muted-foreground">
                  Auto-applies after you download the app
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {!unlocked ? (
                <>
                  <button
                    onClick={() => handleDownload(APP_STORE_URL)}
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-2 text-[9px] font-bold uppercase tracking-wide text-paper transition-opacity hover:opacity-90"
                  >
                    <AppleLogo className="h-3.5 w-3.5" /> App Store
                  </button>
                  <button
                    onClick={() => handleDownload(PLAY_STORE_URL)}
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-ink bg-background px-2 text-[9px] font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
                  >
                    <GooglePlayLogo className="h-3.5 w-3.5" /> Google Play
                  </button>
                </>
              ) : (
                <button
                  onClick={claim}
                  className="col-span-2 h-10 w-full rounded-md bg-ink text-[10px] font-bold uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
                >
                  Continue shopping
                </button>
              )}
              <button
                onClick={close}
                className="col-span-2 h-7 text-[9.5px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
