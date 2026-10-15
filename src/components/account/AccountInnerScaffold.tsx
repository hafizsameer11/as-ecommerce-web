import { ReactNode, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";

type Props = {
  title: string;
  subtitle?: string;
  activeId?: string;
  backTo?: string;
  right?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
};

export function AccountInnerScaffold({
  title,
  subtitle,
  activeId,
  backTo = "/account",
  right,
  maxWidth = "max-w-none",
  children,
}: Props) {
  const isDesktop = useIsDesktop();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isDesktop) {
    return (
      <DesktopShell active="Account">
        <div className="mx-auto max-w-[1600px] px-6 py-6 grid grid-cols-[240px_1fr] gap-6">
          <AccountSidebar activeId={activeId} />
          <div className={`space-y-4 ${maxWidth}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              {right}
            </div>
            {children}
          </div>
        </div>
      </DesktopShell>
    );
  }

  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: backTo })} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display font-bold text-[15px] truncate px-2">{title}</h1>
          <div className="flex items-center gap-2 min-w-[20px]">
            {right}
            <button onClick={() => setMenuOpen(true)} aria-label="Account menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-3 py-3 space-y-3">{children}</div>

      {/* Mobile account menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[82%] max-w-[320px] bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
              <span className="font-display font-bold text-[13px] uppercase tracking-[0.2em]">My Account</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-3" onClick={() => setMenuOpen(false)}>
              <AccountSidebar activeId={activeId} variant="drawer" />
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

