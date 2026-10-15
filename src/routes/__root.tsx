import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorRouteComponent,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LoginModal } from "@/components/auth/LoginModal";
import { QuickAddPanel } from "@/components/shop/QuickAddPanel";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { AppDownloadOffer } from "@/components/AppDownloadOffer";
import { AppInstallBanner } from "@/components/AppInstallBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { Toaster } from "sonner";
import { useCatalogVersion } from "@/lib/catalog-version";



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display font-bold text-[17px] tracking-[0.22em] text-gold whitespace-nowrap">ASL ORIGINALS</div>
        <div className="text-[10px] tracking-[0.4em] text-muted-foreground mt-0.5">ORIGINALS</div>
        <h1 className="mt-8 text-6xl font-display font-bold text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-semibold">This page has moved on</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or is no longer available.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="inline-flex h-10 px-5 items-center rounded-md bg-ink text-white text-[13px] font-semibold">Go home</Link>
          <Link to="/shop" className="inline-flex h-10 px-5 items-center rounded-md border border-border text-[13px] font-semibold">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display font-bold text-[17px] tracking-[0.22em] text-gold whitespace-nowrap">ASL ORIGINALS</div>
        <div className="text-[10px] tracking-[0.4em] text-muted-foreground mt-0.5">ORIGINALS</div>
        <h1 className="mt-8 text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page couldn't load. Please try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex h-10 px-5 items-center rounded-md bg-ink text-white text-[13px] font-semibold"
          >
            Try again
          </button>
          <Link to="/" className="inline-flex h-10 px-5 items-center rounded-md border border-border text-[13px] font-semibold">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ASL ORIGINALS - Premium Style. Original Always." },
      { name: "description", content: "Curated luxury streetwear, footwear, watches, fragrances and accessories from the world's most exclusive brands." },
      { property: "og:title", content: "ASL ORIGINALS - Premium Style. Original Always." },
      { property: "og:description", content: "Curated luxury streetwear, footwear, watches, fragrances and accessories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent as ErrorRouteComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ClientToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Toaster position="top-center" /> : null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const catalogV = useCatalogVersion((s) => s.v);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.all([
        import("@/lib/auth-store").then(({ useAuth }) => useAuth.getState().bootstrap()),
        import("@/lib/catalog-hydrate").then(({ hydrateShopCatalogFromApi }) =>
          hydrateShopCatalogFromApi().catch((err) => console.warn("[catalog]", err))
        ),
      ]);
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${pathname}-${catalogV}-${bootstrapped ? "1" : "0"}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <LoginModal />
      <QuickAddPanel />
      <QuickViewModal />
      <CookieConsent />
      <AppInstallBanner />
      <AppDownloadOffer />
      <ClientToaster />
    </QueryClientProvider>
  );
}

