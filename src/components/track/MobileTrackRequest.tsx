import { MobileShell } from "@/components/shell/MobileShell";
import { useEffect, useState } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, ChevronDown, ChevronRight, Copy, ArrowRight } from "lucide-react";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { trackSteps, helpOptions, statusToStepIndex } from "./trackData";
import { trackConciergeRequest, trackToActive } from "@/lib/concierge-requests";
import heroImg from "@/assets/track-hero.png";
import productImg from "@/assets/p-nike-dunk.png";

const GOLD = "#cc5000";

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const },
  { id: "request", label: "Request", Icon: Plus, center: true, to: "/start-request" as const },
  { id: "track", label: "Track", Icon: MapPin, active: true, to: "/track-request" as const },
  { id: "account", label: "Account", Icon: User },
];

export function MobileTrackRequest({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [inputId, setInputId] = useState(id || "");
  const [showHelp, setShowHelp] = useState(false);
  const [active, setActive] = useState<ReturnType<typeof trackToActive> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { setInputId(id || ""); }, [id]);

  useEffect(() => {
    if (!id) {
      setActive(null);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    setNotFound(false);
    trackConciergeRequest(id).then((track) => {
      if (cancelled) return;
      if (!track) {
        setActive(null);
        setNotFound(true);
        return;
      }
      setActive(trackToActive(track, productImg));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const display = active ?? {
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
  const activeStepIndex = active
    ? (active.trackStep != null ? active.trackStep : statusToStepIndex(active.status))
    : 0;
  const miniIndices = [0, 2, 6, 8, 9];
  const mini = miniIndices.map((i) => trackSteps[i]);
  let currentMini = 0;
  for (let i = 0; i < miniIndices.length; i++) {
    if (miniIndices[i]! <= activeStepIndex) currentMini = i;
  }


  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop" onBack={() => window.history.back()}>
      <div className="bg-[#edebdf] pb-4">

      {/* Breadcrumb */}
      <div className="px-4 pt-4 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">Track Request</span>
      </div>

      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="px-3 pt-5">
        <div className="relative rounded-xl overflow-hidden bg-[#f0e8d8]">
          <img
            src={heroImg}
            alt="Luxury tracking"
            className="absolute inset-y-0 right-0 h-full w-[60%] object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] from-25% via-[#f5efe4]/88 via-45% to-transparent to-65%" />
          <div className="relative grid grid-cols-2 gap-2 items-center">
            <div className="pl-4 py-6">
              <div className="h-8 w-8 rounded-full border border-gold grid place-items-center mb-2">
                <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} />
              </div>
              <h1 className="font-display font-medium text-[22px] leading-[1.02] tracking-[0.02em] text-ink">
                TRACK YOUR<br />REQUEST
              </h1>
              <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed max-w-[90%]">
                Stay updated with every step from sourcing to delivery.
              </p>
            </div>
            <div className="h-[200px]" />
          </div>
        </div>
      </motion.section>

      {/* Input */}
      <section className="px-4 pt-4">
        <div className="rounded-xl bg-white border border-black/10 p-4 shadow-sm">
          <input value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="Enter your Request ID (e.g. ASL123456)"
            className="w-full bg-[#fafafa] border border-black/10 rounded px-4 py-3 text-[12.5px] outline-none focus:border-gold transition placeholder:text-muted-foreground/60" />
          <div className="mt-3 flex items-center gap-3">
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => {
              const q = inputId.trim();
              if (!q) return toast.error("Enter a request ID");
              navigate({ to: "/track-request", search: { id: q } });
              toast.success("Tracking " + q);
            }}
              className="flex-1 bg-ink text-white py-3.5 text-[11.5px] font-semibold tracking-[0.22em] rounded">
              TRACK NOW
            </motion.button>
            <button onClick={() => navigate({ to: "/account/help/contact" })}
              className="flex items-center gap-2 border border-black/15 px-4 py-3.5 text-[11px] font-semibold tracking-[0.15em] rounded hover:bg-black/5 shrink-0">
              <span className="h-4 w-4 rounded-full border border-current grid place-items-center text-[10px] leading-none">?</span> NEED HELP?
            </button>
          </div>
        </div>
        <button onClick={() => setShowHelp((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-[11.5px] font-semibold text-gold">
          Where can I find my Request ID? <ChevronDown className={`h-4 w-4 transition ${showHelp ? "rotate-180" : ""}`} />
        </button>
        {showHelp && (
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Your Request ID (starting with ASL) was sent to your email and appears under "My Requests".
          </p>
        )}
      </section>

      {/* Current status card */}
      <section className="px-4 mt-6">
        <div className="rounded border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold tracking-[0.18em] text-ink">CURRENT STATUS</div>
            <span className="text-[9.5px] font-bold tracking-[0.14em] bg-ink text-white border border-ink px-2 py-1 rounded">{display.status}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-5">Your order is on the way to you.</p>
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-[18px] left-[9%] right-[9%] h-[2px] bg-border -translate-y-1/2" />
            {/* Active line */}
            <div
              className="absolute top-[18px] left-[9%] h-[2px] bg-ink -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(currentMini / (mini.length - 1)) * 82}%` }}
            />
            <div className="relative flex items-start justify-between">
              {mini.map((s, i) => {
                const done = i < currentMini;
                const current = i === currentMini;
                const isLast = i === mini.length - 1;
                return (
                  <div key={s.id} className="flex flex-col items-center text-center flex-1 px-0.5">
                    <div
                      className={`h-9 w-9 rounded-full border-2 grid place-items-center bg-white ${
                        done || current ? "border-ink text-ink" : "border-black/20 text-muted-foreground"
                      }`}
                    >
                      {isLast && !done && !current ? (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      ) : (
                        <s.Icon className="h-4 w-4" strokeWidth={1.6} />
                      )}
                    </div>
                    <div className="mt-2 text-[9px] font-semibold text-ink leading-tight">{s.short}</div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">{s.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Your request */}
      <section className="px-4 mt-4">
        <div className="rounded border border-black/10 bg-white p-4">
          <div className="text-[11px] font-bold tracking-[0.18em] text-ink mb-3">YOUR REQUEST</div>
          <button onClick={() => goToLabel("Details")} className="w-full flex items-center gap-3 text-left">
            <div className="h-16 w-16 rounded bg-[#edebdf] grid place-items-center shrink-0">
              <img src={display.image} alt="Item" className="h-14 w-14 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink leading-snug">{display.item}</div>
              <div className="text-[10.5px] text-muted-foreground mt-1">Size: {display.size}</div>
              <div className="text-[10.5px] text-muted-foreground">Color: {display.color}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
          <div className="mt-4 pt-4 border-t border-black/5 space-y-2">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">Request ID</span>
              <span className="font-semibold text-ink flex items-center gap-1.5">{display.id}
                <Copy className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" onClick={() => { navigator.clipboard.writeText(display.id); toast.success("Copied"); }} />
              </span>
            </div>
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">Request Date</span>
              <span className="font-semibold text-ink">{display.date}</span>
            </div>
          </div>
        </div>

      </section>

      {/* Tracking info */}
      <section className="px-4 mt-4">
        <div className="rounded border border-black/10 bg-white p-4">
          <div className="text-[10.5px] font-bold tracking-[0.16em] text-gold mb-3">TRACKING INFORMATION</div>
          <div className="flex items-center justify-between text-[11.5px] mb-2">
            <span className="text-muted-foreground">Tracking Number</span>
            <span className="font-semibold text-ink flex items-center gap-1.5">{display.tracking}
              <Copy className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" onClick={() => { navigator.clipboard.writeText(display.tracking); toast.success("Copied"); }} />
            </span>
          </div>
          <div className="flex items-center justify-between text-[11.5px] mb-4">
            <span className="text-muted-foreground">Courier</span>
            <span className="font-semibold text-ink">{display.courier}</span>
          </div>
          <motion.button whileTap="tap" variants={buttonTap} onClick={() => toast("Opening DHL…")}
            className="w-full border border-ink text-ink py-3 text-[11px] font-semibold tracking-[0.22em] rounded">
          TRACK ON DHL
          </motion.button>
        </div>
      </section>

      {/* Need help */}
      <section className="px-2 mt-4 mb-0">
        <div className="rounded border border-black/10 bg-white p-4">
          <div className="text-[11px] font-bold tracking-[0.18em] text-ink mb-4">NEED HELP?</div>
          <div className="space-y-2">
            {helpOptions.map((h) => (
              <button key={h.title} onClick={() => goToLabel(h.title)}
                className="w-full flex items-center gap-3 text-left px-2 py-2 rounded hover:bg-black/5">
                <div className="h-9 w-9 rounded-full bg-[#faf3e3] grid place-items-center shrink-0">
                  <h.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-ink">{h.title}</div>
                  <div className="text-[10.5px] text-muted-foreground truncate">{h.sub}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded border border-[#e6d9be] bg-[#faf3e3] p-3">
            <div className="h-4 w-4 rounded-full bg-gold text-ink text-[9px] font-bold grid place-items-center mt-0.5">i</div>
            <p className="text-[10.5px] text-ink/80 leading-snug">All requests are processed securely and your information is protected.</p>
          </div>
        </div>
      </section>

      </div>
    </MobileShell>
  );
}
