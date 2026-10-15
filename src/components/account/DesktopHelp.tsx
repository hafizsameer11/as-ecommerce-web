import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, MessageSquare } from "lucide-react";
import { useTickets } from "@/lib/tickets-store";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { heroBanner, supportChannels, supportHours, satisfactionBanner } from "./helpData";
import { useStoreFaqs } from "@/lib/faq-store";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function DesktopHelp() {
  const nav = useNavigate();
  const hydrate = useTickets((s) => s.hydrate);
  const openTicketCount = useTickets((s) =>
    s.tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length
  );
  const hydrateFaqs = useStoreFaqs((s) => s.hydrate);
  const faqItems = useStoreFaqs((s) => s.items);
  useEffect(() => {
    void hydrate();
    void hydrateFaqs();
  }, [hydrate, hydrateFaqs]);

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="help" />

        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-4xl font-bold">Help & Support</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We're here to help. Choose a way to get in touch or find answers to common questions.
            </p>
          </motion.div>

          {/* Hero card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-6 rounded-xl bg-[#f5efe6] p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 grid place-items-center text-amber-600">
                <heroBanner.Icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-[15px]">{heroBanner.title}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{heroBanner.desc}</div>
              </div>
            </div>
            <button
              onClick={() => nav({ to: "/account/help/contact" })}
              className="rounded-md bg-ink text-white text-[13px] font-semibold px-6 py-3 hover:bg-ink/90 transition-colors"
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
            className="mt-4 w-full flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow text-left"
          >
            <div className="h-12 w-12 rounded-full bg-gold/15 grid place-items-center text-ink shrink-0">
              <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[14px]">My Support Tickets</div>
              <div className="text-[12.5px] text-muted-foreground mt-0.5">
                {openTicketCount > 0
                  ? `${openTicketCount} active conversation${openTicketCount === 1 ? "" : "s"} · Track replies from our team`
                  : "View all your conversations with our support team"}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </motion.button>

          {/* Get Support - full width */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mt-6">
            <h2 className="font-display text-lg font-bold mb-4">Get Support</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 gap-4"
            >
              {supportChannels.map((c) => (
                <div key={c.id} className="flex flex-col">
                  <motion.button
                    variants={staggerItem}
                    onClick={() => nav({ to: "/account/help/contact" })}
                    className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-sm transition-shadow"
                  >
                    <div className={`h-12 w-12 rounded-full ${c.bg} grid place-items-center ${c.color} mb-4`}>
                      <c.Icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <div className="font-semibold text-[15px]">{c.title}</div>
                    <div className="text-[13px] text-muted-foreground mt-1 leading-snug">{c.desc}</div>
                    <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <span className="text-[13px] font-semibold">{c.cta}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                  {c.footnote && (
                    <div className="text-[11px] text-muted-foreground mt-2 text-right">{c.footnote}</div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* FAQ + Support Hours */}
          <div className="mt-6 grid grid-cols-[1fr_320px] gap-6">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <h2 className="font-display text-lg font-bold mb-4">Frequently Asked Questions</h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {faqItems.slice(0, 5).map((f, idx) => (
                  <button
                    key={f.q}
                    onClick={() => nav({ to: "/faq" })}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors ${
                      idx !== Math.min(faqItems.length, 5) - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="text-[14px] font-medium">{f.q}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col">
              <h2 className="font-display text-lg font-bold mb-4">Support Hours</h2>
              <div className="rounded-xl bg-[#f5efe6] p-5 flex flex-col justify-between flex-1">
                {supportHours.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/70 grid place-items-center text-ink shrink-0">
                      <h.Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold">{h.label}</div>
                      <div className="text-[13px] text-muted-foreground mt-1">{h.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>


          {/* Satisfaction banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-6 rounded-xl bg-[#f5efe6] p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-50 grid place-items-center text-amber-600">
                <satisfactionBanner.Icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-[15px]">{satisfactionBanner.title}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{satisfactionBanner.desc}</div>
              </div>
            </div>
            <button
              onClick={() => nav({ to: "/account/help/contact" })}
              className="rounded-md bg-ink text-white text-[13px] font-semibold px-6 py-3 hover:bg-ink/90 transition-colors"
            >
              {satisfactionBanner.cta}
            </button>
          </motion.div>
        </div>
      </div>
    </DesktopShell>
  );
}
