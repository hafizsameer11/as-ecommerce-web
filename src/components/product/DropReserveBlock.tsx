import { RosetteCheckIcon } from "@/components/home/TrustIcons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatNaira, type Product } from "@/lib/shop-data";
import { balanceFor, countdownParts, depositFor, formatDropDate, type Drop } from "@/lib/coming-soon";
import { useReservations } from "@/lib/reservations-store";
import { buttonTap } from "@/lib/motion";

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Countdown({ releaseAt }: { releaseAt: string }) {
  const now = useNow();
  if (now === null) return <div className="h-[46px]" />;
  const { days, hours, minutes, seconds, released } = countdownParts(releaseAt, now);
  if (released) {
    return <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold">Dropping now</div>;
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

export function DropReserveBlock({
  drop,
  product,
  size,
  color,
}: {
  drop: Drop;
  product: Product;
  size?: string;
  color?: string;
}) {
  const navigate = useNavigate();
  const reserve = useReservations((s) => s.reserve);
  const alreadyReserved = useReservations((s) =>
    s.items.some((i) => i.dropId === drop.id && (i.status === "Reserved" || i.status === "Pending")),
  );
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const deposit = drop.deposit ?? depositFor(product.price, drop.depositPct);
  const balance = drop.balance ?? balanceFor(product.price, drop.depositPct);
  const pct = Math.min(100, Math.round((drop.reservedCount / drop.allocation) * 100));

  const handleReserve = async () => {
    if (product.sizes.length > 0 && !size) {
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
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        image: product.image,
        size,
        color,
        price: product.price,
        deposit,
        balance,
        releaseAt: drop.releaseAt,
      });
      if (res.paymentUrl) {
        toast.success("Complete payment to secure your allocation");
        window.location.href = res.paymentUrl;
        return;
      }
      toast.success("Reservation held — deposit confirmed");
      navigate({ to: "/coming-soon" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve this drop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Countdown / allocation */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> Drops {formatDropDate(drop.releaseAt)}
        </div>
        <div className="mt-3">
          <Countdown releaseAt={drop.releaseAt} />
        </div>
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {drop.reservedCount} of {drop.allocation} allocation reserved
          </div>
        </div>
      </div>

      {/* Deposit breakdown */}
      <div className="rounded-lg border border-border p-4 text-[12.5px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Retail price</span>
          <span className="font-semibold text-ink">{formatNaira(product.price)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground">Deposit due today (50%)</span>
          <span className="font-semibold text-ink">{formatNaira(deposit)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">Balance on release</span>
          <span className="font-semibold text-ink">{formatNaira(balance)}</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-black"
        />
        <span>
          I understand the 50% deposit secures my allocation and the balance becomes payable when the piece
          drops. Deposits are refundable up to 48 hours before release.
        </span>
      </label>

      <motion.button
        whileTap="tap"
        variants={buttonTap}
        onClick={() => void handleReserve()}
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[3px] bg-ink text-[12px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
      >
        <Lock className="h-4 w-4" strokeWidth={2} />
        {busy
          ? "Processing…"
          : alreadyReserved
            ? "Reserve Another"
            : `Reserve - Pay ${formatNaira(deposit)} Deposit`}
      </motion.button>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" strokeWidth={1.75} /> Secured checkout
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
        <RosetteCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
        <div className="text-[11.5px] text-muted-foreground">
          <span className="font-semibold text-ink">Guaranteed allocation.</span> Reserved pieces are held in your
          name and shipped the moment the drop goes live.
        </div>
      </div>
    </div>
  );
}
