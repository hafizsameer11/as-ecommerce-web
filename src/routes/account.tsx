import { useEffect, useState } from "react";
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const openLogin = useAuth((s) => s.openLogin);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !isLoggedIn) openLogin("signin");
  }, [hydrated, isLoggedIn, openLogin]);

  if (!hydrated) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-paper">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-ink/5 inline-flex items-center justify-center">
            <Lock className="h-5 w-5 text-ink" strokeWidth={1.75} />
          </div>
          <h1 className="mt-5 text-[18px] font-semibold tracking-[0.12em] uppercase text-ink">
            Sign in required
          </h1>
          <p className="mt-2 text-[13px] text-foreground/70 leading-relaxed">
            Please sign in to access your account, orders, rewards, wallet and referrals.
          </p>
          <button
            onClick={() => openLogin("signin")}
            className="mt-6 w-full h-11 rounded-md bg-ink text-paper text-[12px] font-semibold tracking-[0.16em] uppercase"
          >
            Sign in
          </button>
          <button
            onClick={() => openLogin("signup")}
            className="mt-2.5 w-full h-11 rounded-md border border-ink/20 text-ink text-[12px] font-semibold tracking-[0.16em] uppercase"
          >
            Create account
          </button>
          <Link
            to="/"
            className="mt-5 inline-block text-[12px] text-muted-foreground underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
