import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, MessageCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRouteApi } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { orderStatusStyle } from "./ordersData";
import { buttonTap } from "@/lib/motion";
import { loadOrderTracking, type TrackView } from "@/lib/order-tracking";
import { ApiError } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/api/settings";

const routeApi = getRouteApi("/account/track");
const NGN = new Intl.NumberFormat("en-NG");

function statusTone(status: string): string {
  const key = (status || "").toLowerCase();
  if (key.includes("deliver")) return orderStatusStyle.Delivered;
  if (key.includes("ship") || key.includes("transit") || key.includes("out")) return orderStatusStyle.Shipped;
  if (key.includes("cancel")) return orderStatusStyle.Cancelled;
  if (key.includes("return") || key.includes("refund")) return orderStatusStyle.Returned;
  return orderStatusStyle.Processing;
}

export function MobileAccountTrack() {
  const search = routeApi.useSearch();
  const { data: publicSettings } = usePublicSettings();
  const profile = (publicSettings?.profile ?? {}) as Record<string, unknown>;
  const whatsapp = String(profile.whatsapp || profile.whatsApp || "").replace(/\D/g, "");
  const [id, setId] = useState(search.id ?? "");
  const [lookupId, setLookupId] = useState(search.id ?? "");
  const [view, setView] = useState<TrackView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setId(search.id ?? "");
    setLookupId(search.id ?? "");
  }, [search.id]);

  useEffect(() => {
    if (!lookupId.trim()) {
      setView(null);
      setError(null);
      return;
    }
    let alive = true;
    setBusy(true);
    setError(null);
    void loadOrderTracking(lookupId.trim())
      .then((v) => {
        if (!alive) return;
        setView(v);
      })
      .catch((err) => {
        if (!alive) return;
        setView(null);
        setError(err instanceof ApiError || err instanceof Error ? err.message : "Order not found");
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [lookupId]);

  const runLookup = () => {
    const next = id.trim();
    if (!next) {
      toast.error("Enter an order ID");
      return;
    }
    setLookupId(next);
  };

  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 flex items-center justify-between border-b border-border bg-background px-3 py-3">
        <button onClick={() => history.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-[15px] font-bold">Track Your Order</h1>
        <div className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="space-y-3 px-3 py-3 pb-6">
        <section className="overflow-hidden rounded-lg bg-ink text-paper">
          <div className="px-4 pb-3 pt-4">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-paper/55">Order tracking</div>
            <h2 className="mt-1 font-display text-lg font-bold">Where is your order?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-paper/65">
              Track your order from placement to delivery.
            </p>
          </div>
          <div className="flex items-center gap-2 border-t border-paper/15 p-2">
            <div className="flex flex-1 items-center rounded-md bg-background text-foreground focus-within:ring-1 focus-within:ring-ring">
              <Search className="mx-2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runLookup();
                }}
                placeholder="Order ID"
                aria-label="Order ID"
                className="min-w-0 flex-1 bg-transparent py-2.5 pr-2 text-[11px] outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <motion.button
              whileTap="tap"
              variants={buttonTap}
              disabled={busy}
              onClick={runLookup}
              className="shrink-0 rounded-md bg-background px-4 py-2.5 text-[11px] font-bold text-foreground disabled:opacity-60"
            >
              {busy ? "…" : "Track"}
            </motion.button>
          </div>
        </section>

        <div className="flex items-center justify-between px-0.5 pt-1">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-widest">Tracking details</h2>
          <span className="text-[10px] text-muted-foreground">Orders</span>
        </div>

        {busy && !view && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-0.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </div>
        )}

        {lookupId && error && (
          <div className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">{error}</div>
        )}

        {view && <MobileTrackingCard view={view} />}

        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">Need help?</div>
              <div className="text-[11px] text-muted-foreground">Contact our concierge team</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        ) : (
          <Link
            to="/account/help/contact"
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">Need help?</div>
              <div className="text-[11px] text-muted-foreground">Contact our concierge team</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </div>
    </MobileShell>
  );
}

function MobileTrackingCard({ view }: { view: TrackView }) {
  const items = view.order?.items ?? [];
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="h-1 bg-ink" />
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{view.number}</div>
              <div className="text-[11px] text-muted-foreground">
                {view.delivery === "pickup" ? "Store pickup" : "Shipping"}
              </div>
            </div>
            <span className={`shrink-0 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${statusTone(view.status)}`}>
              {view.status}
            </span>
          </div>
          {(view.eta || view.trackingNumber) && (
            <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
              {view.eta && (
                <>
                  Expected:{" "}
                  <span className="text-foreground font-medium">
                    {new Date(view.eta).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                  </span>
                </>
              )}
              {view.trackingNumber && (
                <>
                  {" "}
                  · Tracking: <span className="text-foreground font-medium">{view.trackingNumber}</span>
                </>
              )}
            </div>
          )}
          {items.length > 0 && (
            <div className="mt-3 divide-y divide-border">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  {it.image ? (
                    <img src={it.image} alt="" className="h-10 w-10 rounded object-cover bg-muted" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">{it.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {it.variant} · Qty {it.qty}
                    </div>
                  </div>
                  <div className="text-[12px] font-semibold">₦{NGN.format(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-3">Timeline</div>
        {view.timeline.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No events yet.</p>
        ) : (
          <ol className="space-y-2.5">
            {view.timeline.map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-ink" : "bg-border"}`} />
                <div>
                  <div className={`text-[12px] ${t.done ? "font-medium" : "text-muted-foreground"}`}>{t.title}</div>
                  <div className="text-[10px] text-muted-foreground">{t.at}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {view.shipmentEvents.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3">Shipment scans</div>
            <ol className="space-y-2.5">
              {view.shipmentEvents.map((e, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full shrink-0 bg-gold" />
                  <div>
                    <div className="text-[12px] font-medium capitalize">{e.title}</div>
                    {e.detail && <div className="text-[10px] text-muted-foreground">{e.detail}</div>}
                    <div className="text-[10px] text-muted-foreground">{e.at}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}
