import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Settings, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { useNotifications, notifCategories, type NotifCategory } from "./notificationsData";
import { fadeInUp } from "@/lib/motion";

export function MobileNotifications() {
  const nav = useNavigate();
  const notifications = useNotifications((s) => s.notifications);
  const hydrate = useNotifications((s) => s.hydrate);
  const markRead = useNotifications((s) => s.markRead);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const [cat, setCat] = useState<NotifCategory>("All");
  const list = cat === "All" ? notifications : notifications.filter((n) => n.category === cat);

  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-[15px]">Notifications</h1>
          <button onClick={() => nav({ to: "/account/notifications/settings" })} aria-label="Settings"><Settings className="h-5 w-5" /></button>
        </div>
        <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto no-scrollbar">
          {notifCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                cat === c ? "bg-ink text-white border-ink" : "bg-white text-foreground/70 border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-4 space-y-3">
        {list.map((n) => {
          const Wrapper: any = n.ctaTo ? Link : "button";
          const wrapperProps: any = n.ctaTo ? { to: n.ctaTo } : { onClick: () => toast(n.cta) };
          return (
            <motion.div
              key={n.id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              onClick={() => n.unread && void markRead(n.id)}
              className="rounded-2xl border border-border bg-white p-3 flex items-start gap-3"
            >
              <div className="h-11 w-11 rounded-full bg-muted grid place-items-center shrink-0">
                <n.Icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {n.tag && <span className="text-[9px] font-bold uppercase tracking-widest bg-ink text-white px-1.5 py-0.5 rounded">{n.tag}</span>}
                  <div className="font-semibold text-[13px]">{n.title}</div>
                </div>
                <div className="text-[12px] text-foreground/70 mt-1 leading-snug">{n.message}</div>
                <Wrapper {...wrapperProps} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-ink">
                  {n.cta} <ArrowRight className="h-3 w-3" />
                </Wrapper>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-muted-foreground">{n.time}</div>
                {n.unread && <span className="mt-2 inline-block h-2 w-2 rounded-full bg-ink" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </MobileShell>
  );
}
