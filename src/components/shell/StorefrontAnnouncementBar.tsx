import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, X } from "lucide-react";
import { useAnnouncements } from "@/lib/announcements-store";
import { useAuth } from "@/lib/auth-store";

const DISMISSED_KEY = "asl-dismissed-storefront-announcements";

function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function StorefrontAnnouncementBar() {
  const items = useAnnouncements((state) => state.items);
  const hydrate = useAnnouncements((state) => state.hydrate);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(readDismissed());
    setMounted(true);
    void hydrate();
  }, [hydrate]);

  const announcement = useMemo(() => {
    if (!mounted) return undefined;
    const now = Date.now();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return items
      .filter((item) => {
        const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : undefined;
        const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : undefined;
        const matchesDevice = item.device === "all" || item.device === (isMobile ? "mobile" : "desktop");
        const matchesAudience =
          item.audience === "everyone" ||
          (item.audience === "guests" && !isLoggedIn) ||
          (item.audience === "members" && isLoggedIn);

        return item.placement === "site_top" &&
          item.status === "live" &&
          !dismissed.includes(item.id) &&
          matchesDevice &&
          matchesAudience &&
          (!startsAt || startsAt <= now) &&
          (!endsAt || endsAt >= now);
      })
      .sort((a, b) => b.priority - a.priority)[0];
  }, [dismissed, isLoggedIn, items, mounted]);

  if (!announcement) return null;

  const dismiss = () => {
    const next = [...dismissed, announcement.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // The bar can still be dismissed for the current render.
    }
  };

  return (
    <aside className="relative z-40 border-b border-paper/15 bg-ink px-9 py-2 text-center text-paper" aria-label="Promotion">
      <div className="mx-auto flex min-h-5 max-w-[1600px] items-center justify-center gap-1.5">
        
        <p className="text-[9px] font-semibold uppercase leading-4 md:text-[10px]">
          {announcement.message}
          {announcement.ctaLabel && announcement.ctaHref ? (
            <Link
              to={announcement.ctaHref}
              className="ml-2 inline-flex items-center gap-0.5 border-b border-paper/60 font-bold text-paper"
            >
              {announcement.ctaLabel}
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          ) : null}
        </p>
      </div>
      {announcement.dismissible ? (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss promotion"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-paper/70 transition-colors hover:text-paper"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </aside>
  );
}