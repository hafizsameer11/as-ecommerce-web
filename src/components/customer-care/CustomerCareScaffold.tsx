import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Headphones, ChevronRight } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { careNav } from "./customerCareData";
import supportImg from "@/assets/care-support.jpg";
import shippingImg from "@/assets/care-shipping.jpg";
import returnsImg from "@/assets/care-returns.jpg";
import legalImg from "@/assets/care-legal.jpg";

const heroByPage: Record<string, string> = {
  "shipping-policy": shippingImg,
  "track-order": shippingImg,
  "return-policy": returnsImg,
  "refund-policy": returnsImg,
  "privacy-policy": legalImg,
  "terms-of-service": legalImg,
  "cookie-policy": legalImg,
  "our-commitment": legalImg,
  "how-it-works": supportImg,
  "faqs": supportImg,
  "contact-us": supportImg,
};

type Props = {
  activeId: string;
  title: string;
  subtitle: string;
  heroSrc?: string;
  showHero?: boolean;
  showSidebar?: boolean;
  children: ReactNode;
};

export function CustomerCareScaffold({ activeId, title, subtitle, heroSrc, showHero = true, showSidebar = true, children }: Props) {
  const hero = heroSrc ?? heroByPage[activeId] ?? supportImg;

  const isDesktop = useIsDesktop();
  const active = careNav.find((n) => n.id === activeId);

  if (isDesktop) {
    return (
      <DesktopShell active="Home">
        <div className="mx-auto max-w-[1400px] px-6 pt-6 text-[12px] text-muted-foreground">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="inline h-3 w-3 mx-1" />
          <span>Customer Care</span>
          <ChevronRight className="inline h-3 w-3 mx-1" />
          <span className="text-ink font-medium">{active?.label ?? title}</span>
        </div>

        <div className="mx-auto max-w-[1400px] px-6 pt-5">
          {showHero ? (
            <section className="relative overflow-hidden rounded-lg bg-ink text-white min-h-[240px] flex items-end">
              <img
                src={hero}
                alt={title}
                width={1600}
                height={900}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
              <div className="relative w-full max-w-2xl p-7">
                <div className="text-[10px] tracking-[0.4em] uppercase text-gold">
                  {active?.label ?? "Customer Care"}
                </div>
                {title && (
                  <h1 className="mt-2 font-display text-[34px] leading-[1.1] font-bold uppercase">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-3 text-[14px] text-white/75 leading-relaxed">{subtitle}</p>
                )}
              </div>
            </section>
          ) : (
            (title || subtitle) && (
              <div className="max-w-xl border-b border-border pb-4">
                {title && <h1 className="font-display text-[32px] leading-[1.1] font-bold">{title}</h1>}
                {subtitle && <p className="mt-3 text-[13.5px] text-muted-foreground max-w-md leading-relaxed">{subtitle}</p>}
              </div>
            )
          )}
        </div>



        <div className={`mx-auto max-w-[1400px] px-6 py-7 grid gap-7 ${showSidebar ? "grid-cols-[240px_1fr]" : "grid-cols-1"}`}>
          {showSidebar && (
            <aside className="space-y-4 self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
              <div className="rounded-lg border border-border bg-white p-3">
                <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Care</div>
                <nav className="space-y-0.5">
                  {careNav.map((n) => {
                    const isActive = n.id === activeId;
                    return (
                      <Link
                        key={n.id}
                        to={n.to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded text-[13px] transition-colors ${
                          isActive ? "bg-ink text-white font-semibold" : "text-foreground/75 hover:bg-muted/50"
                        }`}
                      >
                        <n.Icon className="h-4 w-4" strokeWidth={1.75} />
                        <span>{n.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="rounded-lg border border-border bg-white p-4 text-center">
                <div className="mx-auto h-11 w-11 rounded-full bg-muted grid place-items-center">
                  <Headphones className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="mt-3 font-semibold text-[13.5px]">Need Help?</div>
                <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">Our support team is here to assist you.</p>
                <Link to="/customer-care/contact-us" className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded bg-ink text-white text-[12px] font-semibold">
                  Contact Support
                </Link>
              </div>
            </aside>
          )}

          <div className="min-w-0 space-y-4">{children}</div>
        </div>
      </DesktopShell>
    );
  }

  return (
    <MobileShell activeBottom="account">
      <div className="px-3 pt-3 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="inline h-3 w-3 mx-1" />
        <span>Customer Care</span>
        <ChevronRight className="inline h-3 w-3 mx-1" />
        <span className="text-ink font-medium">{active?.label ?? title}</span>
      </div>

      <div className="px-3 pt-4 pb-4">
        {showHero ? (
          <section className="relative overflow-hidden rounded-lg bg-ink text-white min-h-[240px] flex items-end">
            <img
              src={hero}
              alt={title}
              width={1600}
              height={900}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
            <div className="relative w-full p-4">
              <div className="text-[10px] tracking-[0.4em] uppercase text-gold">
                {active?.label ?? "Customer Care"}
              </div>
              {title && (
                <h1 className="mt-2 font-display text-[22px] leading-[1.15] font-bold uppercase">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-3 text-[13px] text-white/75 leading-relaxed">{subtitle}</p>
              )}
            </div>
          </section>
        ) : (
          <>
            {title && <h1 className="font-display text-xl leading-[1.2] font-bold">{title}</h1>}
            {subtitle && <p className="mt-2 text-[12.5px] text-muted-foreground max-w-md leading-relaxed">{subtitle}</p>}
          </>
        )}
      </div>

      <div className="px-3 pb-6 space-y-4">

        <div className="space-y-4">{children}</div>
      </div>
    </MobileShell>
  );
}
