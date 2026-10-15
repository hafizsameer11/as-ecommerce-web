import { useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth, type AuthMode } from "@/lib/auth-store";
import { AuthPanel } from "@/components/auth/AuthForms";
import authHero from "@/assets/onboard-4.jpg";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "/account",
    mode: (typeof s.mode === "string" ? s.mode : "signin") as AuthMode,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in - ASL ORIGINALS" },
      { name: "description", content: "Sign in or create your ASL ORIGINALS account." },
      { property: "og:title", content: "Sign in - ASL ORIGINALS" },
      { property: "og:description", content: "Access your ASL ORIGINALS wardrobe, wallet and rewards." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next, mode, email: emailQ } = Route.useSearch();
  const navigate = useNavigate();
  const isLoggedIn = useAuth((s) => s.isLoggedIn);

  const safeNext = useMemo(() => {
    if (!next || typeof next !== "string") return "/account";
    const lower = next.toLowerCase();
    if (lower.startsWith("/auth") || lower.startsWith("//") || lower.startsWith("http") || lower.includes("/auth?")) return "/account";
    return next;
  }, [next]);

  useEffect(() => {
    if (isLoggedIn) navigate({ to: safeNext as any, replace: true });
  }, [isLoggedIn, safeNext, navigate]);

  return (
    <div className="min-h-dvh bg-[#0d0d0d] text-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[12px] tracking-widest uppercase text-white/70">Back</span>
        </Link>
        <Link to="/" className="font-display text-[15px] tracking-[0.2em]">ASL ORIGINALS</Link>
        <div className="w-16" />
      </header>

      <main className="flex-1 grid md:grid-cols-2">
        <aside className="hidden md:flex relative bg-black items-end p-10 overflow-hidden">
          <img src={authHero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent" />
          <div className="relative z-10 max-w-md">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">ASL Club</div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">Premium style.<br/>Original always.</h2>
            <p className="mt-4 text-white/80 text-sm">Sign in to unlock member pricing, concierge sourcing, and priority delivery on every drop.</p>
          </div>
        </aside>

        <section className="flex items-start justify-center p-5 md:p-10 bg-white text-ink">
          <AuthPanel onDone={() => navigate({ to: safeNext as any, replace: true })} initialMode={mode} initialEmail={emailQ} />
        </section>
      </main>
    </div>
  );
}
