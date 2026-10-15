import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Package, Tag, Sparkles, Heart, Truck, LucideIcon } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";
import { cmsApi, type NotifPreferences } from "@/lib/api/cms";

export const Route = createFileRoute("/account/notifications/settings")({
  head: () => ({ meta: [{ title: "Notification Settings - ASL ORIGINALS" }, { name: "description", content: "Choose how and when we contact you." }] }),
  component: NotifSettings,
});

type Item = { id: string; label: string; desc: string; Icon: LucideIcon };

const channels: Item[] = [
  { id: "push", label: "Push Notifications", desc: "Real-time alerts on your device", Icon: Bell },
  { id: "email", label: "Email", desc: "Order confirmations & digests", Icon: Mail },
  { id: "sms", label: "SMS", desc: "Delivery updates via text", Icon: MessageSquare },
];

const topics: Item[] = [
  { id: "orders", label: "Order Updates", desc: "Processing, shipping, delivery", Icon: Package },
  { id: "concierge", label: "Concierge Requests", desc: "Sourcing status & offers", Icon: Sparkles },
  { id: "shipping", label: "Shipping & Tracking", desc: "Carrier updates", Icon: Truck },
  { id: "promos", label: "Promotions & Sales", desc: "Exclusive offers", Icon: Tag },
  { id: "wishlist", label: "Wishlist Alerts", desc: "Back in stock, price drops", Icon: Heart },
];

const defaults: Record<string, boolean> = {
  push: true, email: true, sms: false,
  orders: true, concierge: true, shipping: true, promos: false, wishlist: true,
};

function flatten(prefs: NotifPreferences): Record<string, boolean> {
  return { ...prefs.channels, ...prefs.topics };
}

function NotifSettings() {
  const [state, setState] = useState<Record<string, boolean>>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await cmsApi.notificationPreferences();
        if (!cancelled) setState(flatten(prefs));
      } catch (err) {
        console.warn("[notif-settings]", err);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = async (id: string) => {
    const next = !state[id];
    setState((s) => ({ ...s, [id]: next }));
    const isChannel = channels.some((c) => c.id === id);
    try {
      await cmsApi.updateNotificationPreferences(
        isChannel ? { channels: { [id]: next } } : { topics: { [id]: next } }
      );
    } catch (err) {
      setState((s) => ({ ...s, [id]: !next }));
      toast.error(err instanceof Error ? err.message : "Could not update preference");
    }
  };

  const Row = ({ i }: { i: Item }) => (
    <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
      <i.Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]">{i.label}</div>
        <div className="text-[12px] text-muted-foreground">{i.desc}</div>
      </div>
      <button onClick={() => void toggle(i.id)} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${state[i.id] ? "bg-ink" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${state[i.id] ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <>
      <AccountInnerScaffold title="Notification Settings" subtitle="Choose how and when we contact you." activeId="notifications" backTo="/account/notifications">
        {!ready ? (
          <p className="text-[13px] text-muted-foreground text-center py-6">Loading preferences…</p>
        ) : null}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-3 px-1">Channels</h2>
          <div className="rounded-2xl border border-border bg-white px-4">
            {channels.map((c) => <Row key={c.id} i={c} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-3 px-1">Topics</h2>
          <div className="rounded-2xl border border-border bg-white px-4">
            {topics.map((t) => <Row key={t.id} i={t} />)}
          </div>
        </motion.div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
