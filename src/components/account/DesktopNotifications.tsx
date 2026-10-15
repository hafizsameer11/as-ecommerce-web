import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { CheckCheck, Settings, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { useNotifications, notifCategories, type NotifCategory } from "./notificationsData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function DesktopNotifications() {
  const notifications = useNotifications((s) => s.notifications);
  const hydrate = useNotifications((s) => s.hydrate);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const markRead = useNotifications((s) => s.markRead);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const [cat, setCat] = useState<NotifCategory>("All");
  const list = cat === "All" ? notifications : notifications.filter((n) => n.category === cat);

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="notifications" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex items-center justify-between">
            <motion.h1 variants={staggerItem} className="font-display text-3xl font-bold">Notifications</motion.h1>
            <motion.div variants={staggerItem} className="flex items-center gap-5">
              <button onClick={() => void markAllRead()} className="text-[13px] text-foreground/70 hover:text-ink flex items-center gap-1.5">
                <CheckCheck className="h-4 w-4" /> Mark all as read
              </button>
              <Link to="/account/notifications/settings" className="text-[13px] text-foreground/70 hover:text-ink flex items-center gap-1.5">
                <Settings className="h-4 w-4" /> Notification Settings
              </Link>

            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-8 border-b border-border">
            {notifCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`pb-3 text-[13px] transition-colors relative ${
                  cat === c ? "text-ink font-semibold" : "text-foreground/60 hover:text-ink"
                }`}
              >
                {c}
                {cat === c && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
              </button>
            ))}
          </motion.div>

          {/* List */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="divide-y divide-border">
            {list.map((n) => {
              const Wrapper: any = n.ctaTo ? Link : "button";
              const wrapperProps: any = n.ctaTo ? { to: n.ctaTo } : { onClick: () => toast(n.cta) };
              return (
                <div key={n.id} onClick={() => n.unread && void markRead(n.id)} className="py-5 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted grid place-items-center shrink-0">
                    <n.Icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {n.tag && <span className="text-[10px] font-bold uppercase tracking-widest bg-ink text-white px-1.5 py-0.5 rounded">{n.tag}</span>}
                      <div className="font-semibold text-[14px]">{n.title}</div>
                    </div>
                    <div className="text-[13px] text-foreground/70 mt-1">{n.message}</div>
                    <Wrapper {...wrapperProps} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-ink hover:text-gold transition-colors">
                      {n.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Wrapper>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-muted-foreground">{n.time}</div>
                    {n.unread && <span className="mt-2 inline-block h-2 w-2 rounded-full bg-ink" />}
                  </div>
                </div>
              );
            })}
          </motion.div>

          <button className="w-full py-4 rounded-md border border-border text-[13px] font-semibold hover:bg-muted/40 transition-colors">
            Load more
          </button>
        </div>
      </div>
    </DesktopShell>
  );
}
