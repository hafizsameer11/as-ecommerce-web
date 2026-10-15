import { Link, useNavigate } from "@tanstack/react-router";
import { goToLabel } from "@/lib/nav-resolve";
import {
  ChevronLeft,
  Bell,
  Home,
  Grid3x3,
  Plus,
  MapPin,
  User,
  MessageCircle,
  Mail,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { InfoItem } from "./returnsInnerData";

type Props = {
  title: string;
  pageTitle?: string;
  intro?: string;
  items: InfoItem[];
  numbered?: boolean;
  footer?: "policy" | "help" | "contact";
};

const conciergeBottomTabs = [
  { id: "home", label: "HOME", Icon: Home, to: "/" as const },
  { id: "categories", label: "CATEGORIES", Icon: Grid3x3, to: "/concierge-service" as const },
  { id: "request", label: "", Icon: Plus, center: true },
  { id: "track", label: "TRACK", Icon: MapPin },
  { id: "account", label: "ACCOUNT", Icon: User, to: "/account" as const, active: true },
];

function ItemRow({ Icon, title, body, number }: InfoItem & { number?: number }) {
  return (
    <motion.div variants={staggerItem} className="flex items-start gap-4 py-4">
      <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0 relative">
        {number ? (
          <span className="font-display font-bold text-[13px]">{number}</span>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[14px]">{title}</div>
        <div className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">{body}</div>
      </div>
    </motion.div>
  );
}

function DesktopContent({ title, intro, items, numbered, footer }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/account/returns" className="text-[12px] font-semibold text-foreground/70 flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Returns & Exchanges
        </Link>
        <span className="text-[12px] font-semibold">{title}</span>
        <span className="w-32" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-8">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {intro && <p className="text-[13px] text-muted-foreground mt-2">{intro}</p>}

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-4 divide-y divide-border">
          {items.map((it, i) => (
            <ItemRow key={it.title} {...it} number={numbered ? i + 1 : undefined} />
          ))}
        </motion.div>

        {footer === "policy" && (
          <div className="text-center text-[12px] text-muted-foreground mt-6 pt-5 border-t border-border">
            For more information, please contact our support team.
          </div>
        )}
        {footer === "help" && (
          <div className="text-center text-[12px] text-muted-foreground mt-6 pt-5 border-t border-border">
            Need help? Our support team is here for you.
          </div>
        )}
      </motion.div>

      {footer === "contact" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="font-display text-lg font-bold">Contact Support</div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { Icon: MessageCircle, label: "WhatsApp" },
              { Icon: Mail, label: "Email" },
              { Icon: MessageSquare, label: "Live Chat" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => toast(c.label)}
                className="flex items-center justify-center gap-2 py-3 rounded-md border border-border text-[13px] font-semibold hover:bg-muted/50"
              >
                <c.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} /> {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileContent({ title, intro, items, numbered, footer, pageTitle }: Props & { pageTitle: string }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* Header - back arrow, title, notification bell */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5">
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => navigate({ to: "/account/returns" })}
            aria-label="Back"
            className="text-foreground"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
          </motion.button>
          <div className="text-center font-display font-bold text-[15px] tracking-[0.2em] text-foreground">
            {pageTitle}
          </div>
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => toast("No new notifications")}
            aria-label="Notifications"
            className="relative text-foreground"
          >
            <Bell className="h-6 w-6" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sale text-white text-[9px] font-bold grid place-items-center">
              0
            </span>
          </motion.button>
        </div>
      </div>

      <div className="px-3 pt-5 pb-6">
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-[22px] font-bold leading-tight">{title}</h1>
            {intro && <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{intro}</p>}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {items.map((it, i) => (
              <div
                key={it.title}
                className={`flex items-start gap-3 px-4 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="h-9 w-9 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                  {numbered ? (
                    <span className="font-display font-bold text-[12px]">{i + 1}</span>
                  ) : (
                    <it.Icon className="h-4 w-4" strokeWidth={1.6} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">{it.title}</div>
                  <div className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">{it.body}</div>
                </div>
              </div>
            ))}
          </div>

          {footer === "policy" && (
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              For more information, please contact our support team.
            </p>
          )}
          {footer === "help" && (
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              Need help? Our support team is here for you.
            </p>
          )}

          {footer === "contact" && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-display text-base font-bold mb-3">Contact Support</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: MessageCircle, label: "WhatsApp" },
                  { Icon: Mail, label: "Email" },
                  { Icon: MessageSquare, label: "Live Chat" },
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => toast(c.label)}
                    className="flex flex-col items-center gap-2 py-3 rounded-md border border-border text-[11px] font-semibold hover:bg-muted/50"
                  >
                    <c.Icon className="h-5 w-5 text-gold" strokeWidth={1.6} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Concierge-style bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background">
        <div className="grid grid-cols-5 items-end">
          {conciergeBottomTabs.map(({ id, label, Icon, to, active, center }) => {
            const onClick = () => {
              if (to) navigate({ to });
              else goToLabel((label || "Request"));
            };
            if (center) {
              return (
                <div key={id} className="flex justify-center -mt-6">
                  <motion.button
                    whileTap="tap"
                    variants={buttonTap}
                    onClick={onClick}
                    className="h-14 w-14 rounded-full bg-ink text-white grid place-items-center shadow-lg"
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </motion.button>
                  <span className="sr-only">Request</span>
                </div>
              );
            }
            return to ? (
              <Link
                key={id}
                to={to}
                className="flex flex-col items-center gap-1 py-3"
              >
                <Icon className={`h-5 w-5 ${active ? "text-ink" : "text-muted-foreground"}`} strokeWidth={1.75} />
                <span className={`text-[9px] font-semibold tracking-[0.08em] ${active ? "text-ink" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </Link>
            ) : (
              <button
                key={id}
                onClick={onClick}
                className="flex flex-col items-center gap-1 py-3"
              >
                <Icon className={`h-5 w-5 ${active ? "text-ink" : "text-muted-foreground"}`} strokeWidth={1.75} />
                <span className={`text-[9px] font-semibold tracking-[0.08em] ${active ? "text-ink" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-[0.08em] pointer-events-none">
          REQUEST
        </div>
      </div>
    </div>
  );
}

export function ReturnsInnerPage(props: Props) {
  const isDesktop = useIsDesktop();
  const pageTitle = props.pageTitle || props.title;
  if (isDesktop) {
    return (
      <DesktopShell active="Account">
        <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
          <AccountSidebar activeId="returns" />
          <DesktopContent {...props} />
        </div>
      </DesktopShell>
    );
  }
  return <MobileContent {...props} pageTitle={pageTitle} />;
}
