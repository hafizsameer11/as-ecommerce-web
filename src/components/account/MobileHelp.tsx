import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, MessageSquare, ArrowLeft, Bell } from "lucide-react";
import { useTickets } from "@/lib/tickets-store";
import { MobileShell } from "@/components/shell/MobileShell";
import {
  heroBanner,
  supportChannels,
  faqItems,
  satisfactionBanner,
} from "./helpData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function MobileHelp() {
  const nav = useNavigate();
  const hydrate = useTickets((s) => s.hydrate);
  const openTicketCount = useTickets((s) =>
    s.tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length
  );
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      {/* Sub header: back + title */}
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-center font-display font-bold text-[15px]">Help &amp; Support</h1>
          <button onClick={() => nav({ to: "/account/notifications" })} aria-label="Notifications" className="relative justify-self-end">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-3 pt-3 pb-6 space-y-3.5">
        {/* Hero card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-50 grid place-items-center text-amber-600 shrink-0">
              <heroBanner.Icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">{heroBanner.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{heroBanner.desc}</div>
            </div>
          </div>
          <button
            onClick={() => nav({ to: "/account/help/contact" })}
            className="mt-3 w-full rounded-md bg-ink text-white text-[13px] font-semibold py-2.5 hover:bg-ink/90 transition-colors"
          >
            {heroBanner.cta}
          </button>
        </motion.div>

        {/* My Tickets */}
        <motion.button
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          onClick={() => nav({ to: "/account/tickets" })}
          className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/20 transition-colors text-left"
        >
          <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-ink shrink-0">
            <MessageSquare className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[13px]">My Support Tickets</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {openTicketCount > 0 ? `${openTicketCount} active conversation${openTicketCount === 1 ? "" : "s"}` : "View past conversations"}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </motion.button>

        {/* Get Support */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h2 className="font-display font-bold text-[15px] mb-3">Get Support</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {supportChannels.map((c, idx) => (
              <motion.button
                key={c.id}
                variants={staggerItem}
                whileTap={{ scale: 0.99 }}
                onClick={() => nav({ to: "/account/help/contact" })}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/20 transition-colors ${
                  idx !== supportChannels.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className={`h-10 w-10 rounded-full ${c.bg} grid place-items-center ${c.color} shrink-0`}>
                  <c.Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px]">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{c.desc}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQ */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-[15px]">Frequently Asked Questions</h2>
            <button onClick={() => nav({ to: "/faq" })} className="text-[11px] font-semibold text-gold">
              View all
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {faqItems.map((f, idx) => (
              <button
                key={f.id}
                onClick={() => nav({ to: "/account/help/$topic", params: { topic: "orders" } })}
                className={`w-full flex items-center justify-between px-3 py-3 text-left hover:bg-muted/20 transition-colors ${
                  idx !== faqItems.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-[13px] font-medium pr-4">{f.question}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Satisfaction banner */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-50 grid place-items-center text-amber-600 shrink-0">
              <satisfactionBanner.Icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">{satisfactionBanner.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{satisfactionBanner.desc}</div>
            </div>
          </div>
          <button
            onClick={() => nav({ to: "/account/help/contact" })}
            className="mt-3 w-full rounded-md bg-ink text-white text-[13px] font-semibold py-2.5 hover:bg-ink/90 transition-colors"
          >
            {satisfactionBanner.cta}
          </button>
        </motion.div>
      </div>
    </MobileShell>
  );
}
