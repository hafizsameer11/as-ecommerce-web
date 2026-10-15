import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Lock, CreditCard, Package, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { countdownParts, formatDropDate } from "@/lib/coming-soon";
import { useOrders, type PlacedOrder } from "@/lib/orders-store";
import { buttonTap } from "@/lib/motion";

const NGN = new Intl.NumberFormat("en-NG");
const naira = (n: number) => `₦${NGN.format(n)}`;

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function isReservationOrder(o: PlacedOrder | undefined) {
  return Boolean(o?.reservation);
}

function DropCountdown({ releaseAt }: { releaseAt: string }) {
  const now = useNow();
  if (now === null) return <div className="h-[46px]" />;
  const { days, hours, minutes, seconds, released } = countdownParts(releaseAt, now);
  if (released) {
    return (
      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold">
        Drop released - balance due
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {[
        { v: days, l: "Days" },
        { v: hours, l: "Hrs" },
        { v: minutes, l: "Min" },
        { v: seconds, l: "Sec" },
      ].map((c) => (
        <div key={c.l} className="min-w-[48px] rounded-md bg-ink px-2.5 py-1.5 text-center text-paper">
          <div className="font-display text-[16px] font-bold leading-none">{String(c.v).padStart(2, "0")}</div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.18em] text-paper/60">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

/** Deposit / balance panel shown on reservation (drop) orders. */
export function ReservationPanel({ order }: { order: PlacedOrder }) {
  const r = order.reservation!;
  const now = useNow();
  const payBalance = useOrders((s) => s.payBalance);
  const released = now !== null && countdownParts(r.releaseAt, now).released;
  const paidTotal = r.deposit + (r.balancePaid ? r.balance : 0);
  const pct = Math.round((paidTotal / r.retail) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <img src={r.image} alt={r.productName} className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">Pre-order Reservation</div>
          <div className="text-[13.5px] font-semibold leading-snug mt-0.5">{r.productName}</div>
          <div className="text-[11px] text-muted-foreground">
            {r.size ? `Size ${r.size} · ` : ""}Drops {formatDropDate(r.releaseAt)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> Time to drop
        </div>
        <div className="mt-2.5">
          <DropCountdown releaseAt={r.releaseAt} />
        </div>
      </div>

      <div className="text-[12.5px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Retail price</span>
          <span className="font-semibold">{naira(r.retail)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">Deposit paid (50%)</span>
          <span className="font-semibold text-ink">{naira(r.deposit)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">{r.balancePaid ? "Balance paid" : "Balance due on release"}</span>
          <span className={`font-semibold ${r.balancePaid ? "text-ink" : "text-ink"}`}>{naira(r.balance)}</span>
        </div>
        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">{pct}% of total paid</div>
        </div>
      </div>

      {r.balancePaid ? (
        <div className="flex items-center justify-center gap-2 rounded-[3px] bg-muted px-4 py-3 text-[12px] font-semibold text-ink">
          <CheckCircle2 className="h-4 w-4" /> Fully paid - preparing dispatch
        </div>
      ) : (
        <>
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            disabled={!released}
            onClick={() => {
              payBalance(order.id);
              toast.success(`Balance of ${naira(r.balance)} paid - your piece is being prepared`);
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[3px] bg-ink text-[12px] font-bold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CreditCard className="h-4 w-4" strokeWidth={2} />
            Pay Balance - {naira(r.balance)}
          </motion.button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" strokeWidth={1.75} />
            {released ? "Secured checkout" : "Unlocks automatically on drop day"}
          </div>
        </>
      )}
    </div>
  );
}

/** Reservation-specific progress timeline replacing standard shipping steps. */
export function ReservationTimeline({ order }: { order: PlacedOrder }) {
  const r = order.reservation!;
  const now = useNow();
  const released = now !== null && countdownParts(r.releaseAt, now).released;
  const steps = [
    { id: "deposit", label: "Deposit Paid", desc: `${naira(r.deposit)} on ${order.date}`, Icon: Check, done: true },
    { id: "secured", label: "Allocation Secured", desc: "Held in your name", Icon: Lock, done: true },
    { id: "drop", label: "Drop Day", desc: formatDropDate(r.releaseAt), Icon: Clock, done: released },
    {
      id: "balance",
      label: "Balance Payment",
      desc: r.balancePaid ? `${naira(r.balance)} paid` : `${naira(r.balance)} due on release`,
      Icon: CreditCard,
      done: r.balancePaid,
    },
    { id: "shipped", label: "Shipped", desc: r.balancePaid ? (order.tracking ?? "Awaiting dispatch") : "After balance payment", Icon: Truck, done: r.balancePaid && order.status !== "Processing" },
    { id: "delivered", label: "Delivered", desc: order.status === "Delivered" ? "Successfully delivered" : "Pending", Icon: Package, done: order.status === "Delivered" },
  ];

  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 shrink-0 rounded-full grid place-items-center border ${s.done ? "bg-ink border-ink text-white" : "bg-background border-border text-muted-foreground"}`}>
              <s.Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            {i < steps.length - 1 && <div className={`w-px flex-1 ${s.done ? "bg-ink" : "bg-border"}`} />}
          </div>
          <div className="flex-1 pb-3">
            <div className={`text-[13px] font-semibold ${s.done ? "" : "text-muted-foreground"}`}>{s.label}</div>
            <div className="text-[11px] text-muted-foreground">{s.desc}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
