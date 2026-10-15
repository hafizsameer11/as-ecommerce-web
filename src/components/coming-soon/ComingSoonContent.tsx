import { RosetteCheckIcon } from "@/components/home/TrustIcons";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { X, Clock, Lock } from "lucide-react";
import { toast } from "sonner";
import { formatNaira, getProductSizeLabel } from "@/lib/shop-data";
import {
  countdownParts,
  depositFor,
  balanceFor,
  formatDropDate,
  getDrops,
  hydrateDrops,
  subscribeDrops,
  type Drop,
} from "@/lib/coming-soon";
import { useReservations } from "@/lib/reservations-store";
import { buttonTap, staggerContainer, staggerItem } from "@/lib/motion";

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Countdown({ releaseAt, compact = false, text = false }: { releaseAt: string; compact?: boolean; text?: boolean }) {
  const now = useNow();
  if (now === null) return <div className={text ? "h-[14px]" : compact ? "h-[34px]" : "h-[44px]"} />;
  const { days, hours, minutes, seconds, released } = countdownParts(releaseAt, now);
  if (released) {
    return (
      <div className={`whitespace-nowrap font-semibold uppercase text-gold ${text ? "text-[10px] tracking-[0.12em]" : "text-[11px] tracking-[0.2em]"}`}>
        Dropping now
      </div>
    );
  }
  if (text) {
    return (
      <div className="text-[10px] font-semibold text-ink">
        {String(days).padStart(2, "0")}D {String(hours).padStart(2, "0")}H {String(minutes).padStart(2, "0")}M {String(seconds).padStart(2, "0")}S
      </div>
    );
  }
  const cells = [
    { v: days, l: "Days" },
    { v: hours, l: "Hrs" },
    { v: minutes, l: "Min" },
    { v: seconds, l: "Sec" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {cells.map((c) => (
        <div
          key={c.l}
          className={`min-w-[38px] rounded-md bg-ink px-2 py-1 text-center text-paper ${
            compact ? "" : "min-w-[46px] px-2.5 py-1.5"
          }`}
        >
          <div className={`font-display font-bold leading-none ${compact ? "text-[13px]" : "text-[16px]"}`}>
            {String(c.v).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-paper/60">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

function DropCard({ drop, onReserve, compact }: { drop: Drop; onReserve: (d: Drop) => void; compact?: boolean }) {
  const reserved = useReservations((s) => s.items.some((i) => i.dropId === drop.id && i.status === "Reserved"));
  return (
    <motion.div variants={staggerItem} className="group overflow-hidden rounded-xl border border-border bg-card">
      <Link to="/drop/$dropId" params={{ dropId: drop.id }} className="block">
      <div className="relative aspect-square overflow-hidden bg-[#f2f2f2]">
        <img
          src={drop.product.image}
          alt={drop.product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 rounded-[3px] border border-ink bg-card px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-ink">
          Coming Soon
        </div>
        {reserved ? (
          <div className="absolute right-2 top-2 rounded-[3px] bg-gold px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-paper">
            Reserved
          </div>
        ) : null}
      </div>
      </Link>

      <div className="p-2.5 md:p-3">
        <Link to="/drop/$dropId" params={{ dropId: drop.id }} className="block">
          <div className="text-[10px] font-bold tracking-widest text-ink">{drop.product.brand}</div>
          <div className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-foreground/90 md:text-[13px]">
            {drop.product.name}
          </div>

        </Link>

        <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 uppercase">
            <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            {formatDropDate(drop.releaseAt, true)}
          </span>
          <Countdown releaseAt={drop.releaseAt} text />
        </div>

        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-ink">{formatNaira(drop.product.price)}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            50% = {formatNaira(depositFor(drop.product.price))}
          </div>
        </div>

        <motion.button
          {...buttonTap}
          onClick={() => onReserve(drop)}
          disabled={reserved}
          className={`mt-2.5 w-full py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
            reserved
              ? "cursor-default border border-border bg-muted text-muted-foreground"
              : "bg-ink text-paper hover:bg-gold"
          }`}
        >
          {reserved ? "Reservation Held" : "Reserve with 50%"}
        </motion.button>

      </div>
    </motion.div>
  );
}

function ReserveSheet({ drop, onClose }: { drop: Drop | null; onClose: () => void }) {
  const reserve = useReservations((s) => s.reserve);
  const [size, setSize] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSize(null);
    setAgree(false);
  }, [drop?.id]);

  useEffect(() => {
    document.body.style.overflow = drop ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drop]);

  if (!drop) return null;
  const deposit = drop.deposit ?? depositFor(drop.product.price, drop.depositPct);
  const balance = drop.balance ?? balanceFor(drop.product.price, drop.depositPct);
  const needsSize = drop.product.sizes.length > 0;

  const submit = async () => {
    if (needsSize && !size) {
      toast.error("Select a size to reserve");
      return;
    }
    if (!agree) {
      toast.error("Please accept the reservation terms");
      return;
    }
    setBusy(true);
    try {
      const res = await reserve({
        dropId: drop.id,
        productId: drop.product.id,
        productName: drop.product.name,
        brand: drop.product.brand,
        image: drop.product.image,
        size: size ?? undefined,
        price: drop.product.price,
        deposit,
        balance,
        releaseAt: drop.releaseAt,
      });
      onClose();
      if (res.paymentUrl) {
        toast.success(`Deposit ${formatNaira(deposit)} — complete payment to secure your allocation`);
        window.location.href = res.paymentUrl;
        return;
      }
      toast.success(`Reserved — deposit ${formatNaira(deposit)} (${res.reservation.id})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve this drop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm md:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-background p-5 md:max-w-[460px] md:rounded-2xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                Reserve this drop
              </div>
              <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-ink">
                50% Deposit
              </h3>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1 text-muted-foreground">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl border border-border p-3">
            <img src={drop.product.image} alt={drop.product.name} className="h-16 w-16 object-contain" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-widest text-ink">{drop.product.brand}</div>
              <div className="text-xs leading-snug text-foreground/90">{drop.product.name}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Ships {formatDropDate(drop.releaseAt)}
              </div>
            </div>
          </div>

          {needsSize ? (
            <div className="mt-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Select size
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {drop.product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[46px] border px-3 py-2 text-[11px] font-medium transition-colors ${
                      size === s ? "border-ink bg-ink text-paper" : "border-border text-foreground hover:border-ink"
                    }`}
                  >
                    {getProductSizeLabel(drop.product, s, drop.product.sizeLabels)}
                  </button>
                ))}
              </div>
              {drop.product.modelFit && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{drop.product.modelFit}</p>}
            </div>
          ) : null}

          <div className="mt-4 space-y-2 rounded-xl bg-muted/60 p-3 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item price</span>
              <span className="font-medium text-ink">{formatNaira(drop.product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit due today (50%)</span>
              <span className="font-bold text-ink">{formatNaira(deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance on release</span>
              <span className="font-medium text-ink">{formatNaira(balance)}</span>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-black"
            />
            <span>
              I understand the 50% deposit secures my allocation and the balance becomes payable when the
              piece drops. Deposits are refundable up to 48 hours before release.
            </span>
          </label>

          <motion.button
            {...buttonTap}
            onClick={() => void submit()}
            disabled={busy}
            className="mt-4 w-full bg-gold py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {busy ? "Processing…" : `Pay ${formatNaira(deposit)} Deposit`}
          </motion.button>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Lock className="h-3 w-3" strokeWidth={1.5} /> Secured payment
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MyReservations() {
  const items = useReservations((s) => s.items);
  const cancel = useReservations((s) => s.cancel);
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-base font-bold uppercase tracking-widest text-ink md:text-xl">
        Your Reservations
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <img src={r.image} alt={r.productName} className="h-14 w-14 shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold tracking-widest text-ink">{r.brand}</div>
              <div className="truncate text-xs leading-snug text-foreground/90">{r.productName}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {r.id} · {r.size ? `Size ${r.size} · ` : ""}Deposit {formatNaira(r.deposit)} · Balance{" "}
                {formatNaira(r.balance)}
              </div>
            </div>
            {r.status === "Reserved" || r.status === "Pending" ? (
              <button
                onClick={() => {
                  void cancel(r.id).then(() => toast("Reservation cancelled - deposit refunded"));
                }}
                className="shrink-0 border border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-ink hover:border-ink"
              >
                Cancel
              </button>
            ) : (
              <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                Cancelled
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComingSoonContent({ compact = false }: { compact?: boolean }) {
  const [, tick] = useState(0);
  const hydrateReservations = useReservations((s) => s.hydrate);
  const [active, setActive] = useState<Drop | null>(null);

  useEffect(() => {
    void hydrateDrops();
    void hydrateReservations();
    const unsub = subscribeDrops(() => tick((n) => n + 1));
    return () => {
      unsub();
    };
  }, [hydrateReservations]);

  const drops = useMemo(() => getDrops(), [tick]);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero */}
      <section className="bg-ink px-4 py-10 text-paper md:px-10 md:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-8 bg-gold/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Dropping Soon
            </span>
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold uppercase leading-[1.1] tracking-[-0.02em] md:text-[56px]">
            Coming Soon.
            <br />
            Reserve Yours.
          </h1>
          <p className="mt-3 max-w-[52ch] text-[12px] leading-relaxed text-paper/65 md:text-[15px]">
            Secure any upcoming piece with a 50% deposit. We hold your size from our allocation and you
            settle the balance the moment it drops.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-paper/70">
            <span className="flex items-center gap-1.5">
              <RosetteCheckIcon className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Guaranteed allocation
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Secured deposit
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Refundable 48h before release
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-3 pt-6 md:px-10 md:pt-10">
        <h2 className="font-display text-base font-bold uppercase tracking-widest text-ink md:text-xl">
          Upcoming Drops{" "}
          <span className="font-sans text-xs font-normal normal-case text-muted-foreground">
            {drops.length} pieces
          </span>
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
        >
          {drops.map((d) => (
            <DropCard key={d.id} drop={d} compact={compact} onReserve={setActive} />
          ))}
        </motion.div>

        <MyReservations />

        <section className="mt-10 rounded-xl border border-border p-4 md:p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-ink">
            How reservations work
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[
              ["01", "Pay 50%", "Choose your size and pay half the retail price to lock your allocation."],
              ["02", "We hold it", "Your piece is set aside from a limited run - no queue, no restock stress."],
              ["03", "Settle & ship", "On release day you pay the balance and we dispatch immediately."],
            ].map(([n, t, s]) => (
              <div key={n} className="rounded-lg bg-muted/50 p-3">
                <div className="text-[10px] font-bold tracking-[0.2em] text-gold">{n}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-ink">{t}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {active ? <ReserveSheet drop={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
