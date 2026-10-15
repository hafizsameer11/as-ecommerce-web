import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PackageSearch, CheckCircle2, PackageOpen, Truck, Home } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { accountApi, type ApiOrderDetail } from "@/lib/api/account";

export const Route = createFileRoute("/customer-care/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order - ASL ORIGINALS" },
      { name: "description", content: "Track your ASL ORIGINALS order in real time using your order number or email." },
    ],
  }),
  component: TrackOrder,
});

const FALLBACK_ICONS = [CheckCircle2, PackageOpen, Truck, Home];

function TrackOrder() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<ApiOrderDetail | null>(null);
  const [invalid, setInvalid] = useState<"id" | "email" | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) {
      setInvalid("id");
      return toast.error("Please fill out this field.", { description: "Order Number" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setInvalid("email");
      return toast.error("Please enter a valid email address.");
    }
    setInvalid(null);
    setBusy(true);
    try {
      const res = await accountApi.lookupOrder(id.trim(), email.trim());
      setOrder(res);
      toast.success("Order found");
    } catch (err) {
      setOrder(null);
      toast.error(err instanceof Error ? err.message : "Order not found");
    } finally {
      setBusy(false);
    }
  };

  const timeline = order?.timeline?.length
    ? order.timeline.map((t, i) => ({
        Icon: FALLBACK_ICONS[Math.min(i, FALLBACK_ICONS.length - 1)],
        title: t.title,
        desc: t.detail || "",
        done: true,
        date: t.at
          ? new Date(t.at).toLocaleString("en-NG", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
      }))
    : null;

  return (
    <CustomerCareScaffold
      activeId="track-order"
      title="Track Your Order"
      subtitle="Enter your order number and email to see real-time delivery updates."
    >
      <form onSubmit={(e) => void submit(e)} className="rounded-md border border-border bg-white p-5 space-y-3">
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Order Number</label>
          <input
            required
            value={id}
            onChange={(e) => { setId(e.target.value); if (invalid === "id") setInvalid(null); }}
            placeholder="e.g. ASL-2026-000452"
            className={`mt-1.5 w-full h-11 px-3 rounded-md border bg-white text-[13px] ${invalid === "id" ? "border-red-500" : "border-border"}`}
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Email Address</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (invalid === "email") setInvalid(null); }}
            placeholder="you@example.com"
            className={`mt-1.5 w-full h-11 px-3 rounded-md border bg-white text-[13px] ${invalid === "email" ? "border-red-500" : "border-border"}`}
          />
        </div>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-ink text-white text-[13px] font-semibold hover:bg-ink/90 disabled:opacity-60">
          <PackageSearch className="h-4 w-4" /> {busy ? "Looking up…" : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="rounded-md border border-border bg-white p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Order</div>
              <div className="font-semibold text-[15px]">{order.number}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-ink text-white text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> {order.status}
            </span>
          </div>
          {timeline ? (
            <ol className="relative border-l-2 border-border pl-5 space-y-5">
              {timeline.map((t) => (
                <li key={`${t.title}-${t.date}`} className="relative">
                  <span className={`absolute -left-[27px] top-0 h-5 w-5 rounded-full grid place-items-center ${t.done ? "bg-ink text-white" : "bg-muted text-muted-foreground"}`}>
                    <t.Icon className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <div className="font-semibold text-[13.5px]">{t.title}</div>
                  {t.desc ? <div className="text-[12px] text-foreground/70">{t.desc}</div> : null}
                  {t.date ? <div className="text-[11px] text-muted-foreground mt-0.5">{t.date}</div> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[12px] text-muted-foreground">No timeline events yet for this order.</p>
          )}
        </div>
      )}
    </CustomerCareScaffold>
  );
}
