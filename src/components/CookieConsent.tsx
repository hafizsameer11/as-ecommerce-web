import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCookieConsent, saveCookieConsent } from "@/lib/cookie-consent";

type OptionalPreferences = {
  performance: boolean;
  functional: boolean;
  advertising: boolean;
};

const disabledPreferences: OptionalPreferences = {
  performance: false,
  functional: false,
  advertising: false,
};

const allPreferences: OptionalPreferences = {
  performance: true,
  functional: true,
  advertising: true,
};

const preferenceRows = [
  { key: "performance", label: "Performance", description: "Helps us improve how the website works." },
  { key: "functional", label: "Functional", description: "Remembers choices that improve your experience." },
  { key: "advertising", label: "Advertising", description: "Helps us measure and improve relevant campaigns." },
] as const;

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [preferences, setPreferences] = useState<OptionalPreferences>(disabledPreferences);

  useEffect(() => {
    setMounted(true);
    setOpen(getCookieConsent() === null);
  }, []);

  const commit = (next: OptionalPreferences) => {
    saveCookieConsent(next);
    setOpen(false);
    setManaging(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-16 z-[150] px-2 pb-2 md:bottom-0 md:px-4 md:pb-4"
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-paper/15 bg-ink text-paper shadow-2xl">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5 px-3 py-2.5 md:px-4 md:py-3">
              <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="text-[13px] font-bold">Your privacy choices</h2>
                <p className="mt-0.5 text-[11px] leading-relaxed text-paper/70 md:text-[11.5px]">
                  We use essential cookies to run our website. With your permission, optional cookies help us improve your experience and marketing.
                </p>
                <Link
                  to="/customer-care/cookie-policy"
                  className="mt-1 inline-block text-[10.5px] font-semibold text-gold underline underline-offset-2"
                >
                  Read our Cookie Policy
                </Link>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => commit(disabledPreferences)}
                aria-label="Reject optional cookies and close"
                className="h-7 w-7 text-paper/70 hover:bg-paper/10 hover:text-paper"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {managing ? (
              <div className="border-t border-paper/15 px-3 py-2.5 md:px-4">
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <div>
                    <div className="text-[11px] font-semibold">Essential</div>
                    <div className="text-[10px] text-paper/60">Required for shopping and security.</div>
                  </div>
                  <span className="shrink-0 text-[9.5px] font-bold uppercase text-gold">Always on</span>
                </div>
                {preferenceRows.map((row) => (
                  <label key={row.key} className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-paper/10 py-2">
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold">{row.label}</span>
                      <span className="block text-[10px] text-paper/60">{row.description}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences[row.key]}
                      onChange={(event) => setPreferences((current) => ({ ...current, [row.key]: event.target.checked }))}
                      className="h-3.5 w-3.5 shrink-0 accent-[var(--gold)]"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 border-t border-paper/15 px-3 py-2.5 md:flex md:justify-end md:px-4">
              {managing ? (
                <Button type="button" variant="outline" onClick={() => commit(preferences)} className="col-span-2 h-8 border-paper/40 bg-transparent text-paper hover:bg-paper hover:text-ink md:order-3 md:col-span-1">
                  Save preferences
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setManaging(true)} className="col-span-2 h-8 border-paper/40 bg-transparent text-paper hover:bg-paper hover:text-ink md:col-span-1">
                  Manage preferences
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => commit(disabledPreferences)} className="h-8 border-paper/40 bg-transparent text-paper hover:bg-paper hover:text-ink">
                Reject optional
              </Button>
              <Button type="button" onClick={() => commit(allPreferences)} className="h-8 bg-paper text-ink hover:bg-paper/90">
                Accept all
              </Button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}