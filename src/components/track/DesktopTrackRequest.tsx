import { useEffect, useState } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag, Search, User, MapPin, Copy, ChevronDown, ArrowRight } from "lucide-react";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { trackSteps, trackTrust, helpOptions, statusToStepIndex } from "./trackData";
import { trackConciergeRequest, trackToActive } from "@/lib/concierge-requests";
import heroImg from "@/assets/track-hero.png";
import productImg from "@/assets/p-nike-dunk.png";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const },
  { label: "CATEGORIES", to: "/concierge-categories" as const },
  { label: "HOW IT WORKS", to: "/how-it-works" as const },
  { label: "TRACK REQUEST", to: "/track-request" as const, active: true },
  { label: "FAQ", to: "/faq" as const },
];

const GOLD = "#cc5000";

export function DesktopTrackRequest({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [inputId, setInputId] = useState(id || "");
  const [showHelp, setShowHelp] = useState(false);
  const [tracked, setTracked] = useState<ReturnType<typeof trackToActive> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { setInputId(id || ""); }, [id]);

  useEffect(() => {
    if (!id) {
      setTracked(null);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    trackConciergeRequest(id).then((track) => {
      if (cancelled) return;
      if (!track) {
        setTracked(null);
        setNotFound(true);
        return;
      }
      setTracked(trackToActive(track, productImg));
      setNotFound(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const active = tracked ?? {
    id: "",
    date: "",
    item: "Enter a request ID to track",
    size: "—",
    color: "—",
    status: notFound ? "NOT FOUND" : "—",
    tracking: "",
    courier: "",
    estimated: notFound ? "We couldn't find that request." : "Track a request to see live status.",
    image: productImg,
    trackStep: 0,
  };

  const activeStepIndex = tracked
    ? (tracked.trackStep != null ? tracked.trackStep : statusToStepIndex(tracked.status))
    : 0;
  const miniIndices = [0, 2, 6, 8, 9];
  const mini = miniIndices.map((i) => trackSteps[i]);
  let currentMini = 0;
  for (let i = 0; i < miniIndices.length; i++) {
    if (miniIndices[i] <= activeStepIndex) currentMini = i;
  }


  return (
    <div className="min-h-screen bg-[#edebdf]">
      {/* Header */}
      <header className="bg-ink text-white sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <div className="font-display font-bold text-lg tracking-[0.18em] leading-none">ASL ORIGINALS</div>
            <div className="text-[9px] tracking-[0.3em] text-white/60 mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => {
              const cls = `text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-white border-b-2 border-gold pb-5 -mb-[17px]" : "text-white/70 hover:text-white"}`;
              return <Link key={n.label} to={n.to} className={cls}>{n.label}</Link>;
            })}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => goToLabel("Search")} aria-label="Search"><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Account")} aria-label="Account"><User className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <Link to="/start-request">
              <motion.span whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap}
                className="inline-block bg-gold text-ink px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded">
                START A REQUEST
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1600px] px-6 pt-6 text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-2">›</span>
        <span className="text-ink">Track Request</span>
      </div>

      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mx-auto max-w-[1600px] px-6 pt-6">
        <div className="relative rounded-xl overflow-hidden bg-[#f0e8d8]">
          <img src={heroImg} alt="Luxury tracking" className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-left" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] from-30% via-[#f5efe4]/80 via-45% to-transparent to-65%" />
          <div className="relative grid grid-cols-2 gap-10 items-center">
            <div className="pl-10 py-14">
              <div className="h-11 w-11 rounded-full border border-gold grid place-items-center mb-4">
                <MapPin className="h-5 w-5 text-gold" strokeWidth={1.5} />
              </div>
              <h1 className="font-display font-medium text-[54px] leading-[1.02] tracking-[0.02em] text-ink">TRACK YOUR REQUEST</h1>
              <div className="h-[3px] w-16 bg-gold mt-4" />
              <p className="mt-5 text-[13.5px] text-muted-foreground leading-relaxed max-w-md">
                Stay updated with every step. Track your request in real time from sourcing to delivery.
              </p>
              <div className="mt-6 w-full max-w-[620px] rounded-xl bg-white border border-black/10 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <input value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="Enter your Request ID (e.g. ASL123456)"
                    className="flex-1 bg-[#fafafa] border border-black/10 rounded px-4 py-3 text-[12.5px] outline-none focus:border-gold transition placeholder:text-muted-foreground/60" />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
                    onClick={() => {
                      const q = inputId.trim();
                      if (!q) return toast.error("Enter a request ID");
                      if (q) navigate({ to: "/track-request", search: { id: q } });
                      toast.success("Tracking " + q);
                    }}
                    className="bg-ink text-white px-7 py-3 text-[11px] font-semibold tracking-[0.2em] rounded shrink-0">
                    TRACK NOW
                  </motion.button>
                  <button onClick={() => navigate({ to: "/account/help/contact" })}
                    className="flex items-center gap-2 border border-black/15 px-4 py-3 text-[11px] font-semibold tracking-[0.15em] rounded hover:bg-black/5 shrink-0">
                    <span className="h-4 w-4 rounded-full border border-current grid place-items-center text-[10px] leading-none">?</span> NEED HELP?
                  </button>
                </div>
              </div>
              <button onClick={() => setShowHelp((v) => !v)}
                className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold text-gold">
                Where can I find my Request ID? <ChevronDown className={`h-4 w-4 transition ${showHelp ? "rotate-180" : ""}`} />
              </button>
              {showHelp && (
                <p className="mt-3 text-[11.5px] text-muted-foreground max-w-md">
                  Your Request ID (starting with ASL) was sent to your email and appears in your account under "My Requests".
                </p>
              )}
            </div>
            <div className="h-[360px]" />
          </div>
        </div>
      </motion.section>

      {/* Tracking status guide */}
      <section className="mx-auto max-w-[1600px] px-6 pt-14">
        <h2 className="text-center text-[13px] font-bold tracking-[0.22em] text-ink mb-10">TRACKING STATUS GUIDE</h2>
        <div className="relative">
          <div className="absolute top-6 left-4 right-4 h-[2px] bg-border -translate-y-1/2" />
          <div className="relative grid grid-cols-10 gap-2">
            {trackSteps.map((s, i) => {
              const active = i <= activeStepIndex;
              return (
                <div key={s.id} className="flex flex-col items-center text-center">
                  <div className={`h-12 w-12 rounded-full grid place-items-center bg-white border-2 ${active ? "border-ink text-ink" : "border-black/15 text-muted-foreground"}`}>
                    <s.Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className={`h-4 w-4 rounded-full grid place-items-center text-[8px] font-bold ${active ? "bg-ink text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                    <span className="text-[9px] font-bold tracking-[0.08em] text-ink">{s.label}</span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug px-1">{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three cards */}
      <section className="mx-auto max-w-[1600px] px-6 pt-12 pb-14 grid grid-cols-[1fr_1.4fr_1fr] gap-5">
        {/* Your request */}
        <div className="rounded border border-black/10 bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.18em] text-ink mb-4">YOUR REQUEST</div>
          <div className="text-[10.5px] text-muted-foreground">Request ID</div>
          <div className="flex items-center justify-between">
            <div className="text-[12.5px] font-semibold text-ink">{active.id}</div>
            <div className="text-[10.5px] text-muted-foreground">{active.date}</div>
          </div>
          <div className="mt-4 text-[10.5px] text-muted-foreground">Item Requested</div>
          <div className="text-[12.5px] font-semibold text-ink leading-snug">{active.item}</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10.5px] text-muted-foreground">Size</div>
              <div className="text-[12px] text-ink">{active.size}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-muted-foreground">Color</div>
              <div className="text-[12px] text-ink">{active.color}</div>
            </div>
          </div>
          <button onClick={() => goToLabel("Request details")}
            className="mt-5 w-full flex items-center justify-between border border-black/15 rounded px-4 py-2.5 text-[11px] font-semibold tracking-[0.15em] text-ink hover:bg-black/5">
            VIEW REQUEST DETAILS <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="rounded border border-black/10 bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.18em] text-ink mb-4">CURRENT STATUS</div>
          <div className="flex items-center gap-3">
            <span className="text-[9.5px] font-bold tracking-[0.14em] bg-ink text-white border border-ink px-2 py-1 rounded">{active.status}</span>
            <span className="text-[11.5px] text-muted-foreground">Your order is on the way to you.</span>
          </div>
          <div className="mt-6 relative">
            {/* Background line */}
            <div className="absolute top-[22px] left-[5%] right-[5%] h-[2px] bg-border -translate-y-1/2" />
            {/* Active line */}
            <div
              className="absolute top-[22px] left-[5%] h-[2px] bg-ink -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(currentMini / (mini.length - 1)) * 90}%` }}
            />
            <div className="relative flex items-start justify-between">
              {mini.map((s, i) => {
                const done = i < currentMini;
                const current = i === currentMini;
                const isLast = i === mini.length - 1;
                return (
                  <div key={s.id} className="flex flex-col items-center text-center flex-1 px-1">
                    <div
                      className={`h-11 w-11 rounded-full border-2 grid place-items-center bg-white ${
                        done || current ? "border-ink text-ink" : "border-black/20 text-muted-foreground"
                      }`}
                    >
                      {isLast && !done && !current ? (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      ) : (
                        <s.Icon className="h-5 w-5" strokeWidth={1.6} />
                      )}
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-ink leading-tight">{s.short}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{s.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 rounded bg-muted/60 border border-border p-4 grid grid-cols-[1fr_auto_auto] items-center gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-[0.14em] text-ink flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> TRACKING INFORMATION
              </div>
              <div className="mt-2 text-[11.5px] text-ink flex items-center gap-2">
                Tracking Number: <span className="font-semibold">{active.tracking}</span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" onClick={() => { navigator.clipboard.writeText(active.tracking); toast.success("Copied"); }} />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Courier</div>
              <div className="text-[11.5px] font-semibold text-ink">{active.courier}</div>
            </div>
            <button onClick={() => toast("Opening DHL…")}
              className="bg-ink text-white px-4 py-2.5 text-[10.5px] font-semibold tracking-[0.18em] rounded">
              TRACK ON DHL
            </button>
          </div>
        </div>

        {/* Need help */}
        <div className="rounded border border-black/10 bg-white p-5">
          <div className="text-[11px] font-bold tracking-[0.18em] text-ink mb-4">NEED HELP?</div>
          <div className="space-y-3">
            {helpOptions.map((h) => (
              <button key={h.title} onClick={() => goToLabel(h.title)}
                className="w-full flex items-center gap-3 text-left px-2 py-2 rounded hover:bg-black/5">
                <div className="h-8 w-8 rounded-full bg-[#faf3e3] grid place-items-center shrink-0">
                  <h.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-ink">{h.title}</div>
                  <div className="text-[10.5px] text-muted-foreground">{h.sub}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded border border-[#e6d9be] bg-[#faf3e3] p-3">
            <div className="h-4 w-4 rounded-full bg-gold text-ink text-[9px] font-bold grid place-items-center mt-0.5">i</div>
            <p className="text-[10.5px] text-ink/80 leading-snug">All requests are processed securely and your information is protected.</p>
          </div>
        </div>
      </section>

      {/* Footer trust */}
      <footer className="bg-ink text-white">
        <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-4 gap-6">
          {trackTrust.map((t, i) => (
            <div key={t.title} className={`flex items-start gap-3 px-4 ${i > 0 ? "border-l border-white/10" : ""}`}>
              <div className="h-9 w-9 rounded-full border border-gold grid place-items-center shrink-0">
                <t.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.14em]" style={{ color: GOLD }}>{t.title}</div>
                <div className="mt-1 text-[10.5px] text-white/70 leading-snug">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
