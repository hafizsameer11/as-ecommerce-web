import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRouteApi } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { orderStatusStyle } from "./ordersData";
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

export function DesktopAccountTrack() {
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
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="track" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-3xl font-bold">Track Order</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter an order ID to see live shipment updates.</p>
          </motion.div>

          <div className="rounded-lg border border-border bg-card p-5">
            <label className="text-[11px] text-muted-foreground">Enter your Order ID</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 flex items-center border border-border rounded bg-background focus-within:border-ink">
                <Search className="h-4 w-4 mx-3 text-muted-foreground" />
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runLookup();
                  }}
                  placeholder="e.g. ASL-ORD-10248"
                  className="flex-1 bg-transparent px-1 py-3 text-[13px] outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap="tap"
                variants={buttonTap}
                disabled={busy}
                onClick={runLookup}
                className="bg-ink text-white px-6 py-3 text-[13px] font-semibold rounded shrink-0 disabled:opacity-60"
              >
                {busy ? "Looking up…" : "Track"}
              </motion.button>
            </div>
            {lookupId && error && (
              <div className="mt-3 text-[12px] text-rose-600">
                {error} for <span className="font-semibold">{lookupId}</span>.
              </div>
            )}
          </div>

          {busy && !view && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading tracking…
            </div>
          )}

          {view && <TrackingCard view={view} />}

          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-100 grid place-items-center shrink-0">
              <Bell className="h-4 w-4 text-amber-700" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[13px] font-semibold">You will receive an update at each stage.</div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                We'll email and message you as your order moves along.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">Need help?</div>
              <p className="text-[12px] text-muted-foreground mt-0.5">Our concierge team is here to assist you.</p>
            </div>
            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 text-[13px] font-semibold rounded shrink-0"
              >
                <MessageCircle className="h-4 w-4" /> Contact Concierge
              </a>
            ) : (
              <Link
                to="/account/help/contact"
                className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 text-[13px] font-semibold rounded shrink-0"
              >
                <MessageCircle className="h-4 w-4" /> Contact Concierge
              </Link>
            )}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

function TrackingCard({ view }: { view: TrackView }) {
  const order = view.order;
  const items = order?.items ?? [];
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Order</div>
          <div className="font-semibold text-[18px]">{view.number}</div>
          <div className="text-[12px] text-muted-foreground mt-1">
            {view.delivery === "pickup" ? "Store pickup" : "Shipping"}
            {order?.itemsCount != null ? ` · ${order.itemsCount} item(s)` : ""}
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${statusTone(view.status)}`}>
            {view.status}
          </span>
          {view.eta && (
            <div className="text-[12px] text-muted-foreground mt-2">
              Expected: {new Date(view.eta).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
            </div>
          )}
          {view.trackingNumber && (
            <div className="text-[12px] mt-1">
              <span className="text-muted-foreground">{view.carrier ? `${view.carrier} · ` : ""}Tracking:</span>{" "}
              <span className="font-semibold">{view.trackingNumber}</span>
            </div>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-6 divide-y divide-border">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              {it.image ? (
                <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover bg-muted" />
              ) : (
                <div className="h-12 w-12 rounded-md bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                {it.brand && (
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
                    {it.brand}
                  </div>
                )}
                <div className="text-[13px] font-medium">{it.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {it.variant} · Qty {it.qty}
                </div>
              </div>
              <div className="text-[13px] font-semibold">₦{NGN.format(it.price * it.qty)}</div>
            </div>
          ))}
        </div>
      )}

      {order && (
        <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-[13px] max-w-[320px] ml-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₦{NGN.format(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium">-₦{NGN.format(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{order.shipping === 0 ? "Free" : `₦${NGN.format(order.shipping)}`}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-border text-[14px]">
            <span className="font-semibold">Total</span>
            <span className="font-bold">₦{NGN.format(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-[13px] font-bold uppercase tracking-widest mb-4">Order timeline</div>
        {view.timeline.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No timeline events yet.</p>
        ) : (
          <ol className="space-y-3">
            {view.timeline.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${t.done ? "bg-ink" : "bg-border"}`} />
                <div>
                  <div className={`text-[13px] ${t.done ? "font-medium" : "text-muted-foreground"}`}>{t.title}</div>
                  {t.detail && <div className="text-[11px] text-muted-foreground">{t.detail}</div>}
                  <div className="text-[11px] text-muted-foreground">{t.at}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {view.shipmentEvents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-[13px] font-bold uppercase tracking-widest mb-4">Shipment scans</div>
          <ol className="space-y-3">
            {view.shipmentEvents.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 bg-gold" />
                <div>
                  <div className="text-[13px] font-medium capitalize">{e.title}</div>
                  {e.detail && <div className="text-[11px] text-muted-foreground">{e.detail}</div>}
                  <div className="text-[11px] text-muted-foreground">{e.at}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
