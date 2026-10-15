import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import emblem from "@/assets/ASL_emblem_white_transparent.png";
import { useAppDownload } from "@/lib/app-download-store";
import { getCookieConsent } from "@/lib/cookie-consent";

const SESSION_KEY = "asl-app-banner-dismissed";

export function AppInstallBanner() {
  const [show, setShow] = useState(false);
  const claimedAt = useAppDownload((s) => s.claimedAt);
  const hydrate = useAppDownload((s) => s.hydrate);
  const offerPct = useAppDownload((s) => s.offer?.percent ?? 10);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    let timeout: number | undefined;
    const hideForOffer = () => setShow(false);
    const schedule = () => {
      if (!getCookieConsent()) return;
      timeout = window.setTimeout(() => setShow(true), 900);
    };
    schedule();
    window.addEventListener("asl:cookie-consent-updated", schedule);
    window.addEventListener("asl:app-offer-opened", hideForOffer);
    return () => {
      if (timeout) window.clearTimeout(timeout);
      window.removeEventListener("asl:cookie-consent-updated", schedule);
      window.removeEventListener("asl:app-offer-opened", hideForOffer);
    };
  }, []);

  if (claimedAt) return null;

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const openOffer = () => {
    dismiss();
    window.dispatchEvent(new CustomEvent("asl:open-app-offer"));
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-0 right-0 z-[120] px-3 md:bottom-4"
        >
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-ink px-3 py-2.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]">
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-[0.5px] border-paper/50 bg-ink">
              <img src={emblem} alt="ASL ORIGINALS" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-paper">ASL ORIGINALS — Shop Luxury</div>
              <div className="truncate text-[11px] text-paper/60">Get our official app — {offerPct}% off your next order.</div>
            </div>
            <button
              onClick={openOffer}
              className="shrink-0 rounded-full bg-paper px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-ink"
            >
              Get
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 text-paper/50 transition-colors hover:text-paper"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
