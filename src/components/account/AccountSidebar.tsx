import { useState } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { sideNavSections, type MenuItem } from "./accountData";
import { useAuth } from "@/lib/auth-store";
import { openAppStore } from "@/lib/app-store";

function Row({ n, active }: { n: MenuItem; active: boolean }) {
  const signOut = useAuth((s) => s.signOut);
  const openLogin = useAuth((s) => s.openLogin);
  const isLogout = n.id === "logout";
  const Cmp: any = n.to && !isLogout && !n.external ? Link : "button";
  const props: any = n.external
    ? { onClick: openAppStore }
    : isLogout
    ? { onClick: () => { signOut(); toast.success("Signed out"); openLogin("signin", "/account"); } }
    : n.to
    ? { to: n.to }
    : { onClick: () => goToLabel(n.label) };
  const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors ${
    active ? "bg-muted font-semibold" : "text-foreground/70 hover:bg-muted/50"
  } ${isLogout ? "text-rose-600 hover:text-rose-700" : ""}`;
  return (
    <Cmp {...props} className={cls}>
      <n.Icon className="h-4 w-4" strokeWidth={1.75} />
      <span className="flex-1 text-left">{n.label}</span>
      {n.badge && (
        <span className="h-5 w-5 rounded-full bg-ink text-white text-[10px] font-bold grid place-items-center">
          {n.badge}
        </span>
      )}
    </Cmp>
  );
}

export function AccountSidebar({ activeId = "overview", variant = "default" }: { activeId?: string; variant?: "default" | "drawer" }) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      sideNavSections
        .filter((s) => s.collapsible)
        .map((s) => [s.id, (s.defaultOpen ?? true) || s.items.some((i) => i.id === activeId)]),
    ),
  );

  return (
    <aside className={variant === "drawer" ? "space-y-4" : "space-y-4 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar border-r border-border pr-6"}>
      {sideNavSections.map((section) => {
        const isCollapsible = section.collapsible;
        const isOpen = isCollapsible ? openMap[section.id] : true;
        return (
          <div key={section.id} className="space-y-1">
            {section.label && !isCollapsible && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {section.label}
              </div>
            )}
            {isCollapsible && section.label && (
              <button
                onClick={() => setOpenMap((m) => ({ ...m, [section.id]: !m[section.id] }))}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-muted/40 rounded-md"
              >
                {section.Icon && <section.Icon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />}
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                />
              </button>
            )}
            {isOpen && (
              <nav className={`space-y-1 ${isCollapsible ? "pl-2 border-l border-border ml-3" : ""}`}>
                {section.items.map((n) => (
                  <Row key={n.id} n={n} active={n.id === activeId} />
                ))}
              </nav>
            )}
          </div>
        );
      })}
    </aside>
  );
}
