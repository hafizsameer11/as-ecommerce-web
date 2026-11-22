import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import { storeAuthApi } from "@/lib/api/auth";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { useIsDesktop } from "@/hooks/use-breakpoint";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset password · ASL ORIGINALS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const isDesktop = useIsDesktop();
  const { token } = Route.useSearch();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // On phones, try opening the native app deep link once (falls through to this web form).
  useEffect(() => {
    if (!token || token.length < 20 || typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!mobile) return;
    const appUrl = `asloriginals://reset-password?token=${encodeURIComponent(token)}`;
    const t = window.setTimeout(() => {
      window.location.href = appUrl;
    }, 400);
    return () => window.clearTimeout(t);
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length < 20) {
      toast.error("This reset link is missing or invalid.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await storeAuthApi.resetPassword(token, password);
      toast.success("Password updated — sign in with your new password");
      nav({ to: "/auth", search: { mode: "signin", next: "/account", email: undefined } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <form onSubmit={(e) => void submit(e)} className="w-full max-w-md mx-auto space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Account</div>
        <h1 className="font-display text-2xl font-bold mt-1">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a new password for your ASL account.</p>
      </div>
      {!token && (
        <p className="text-[12px] text-rose-600">
          This page needs a valid reset token from your email. Request a new link from sign in → Forgot password.
        </p>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-3 text-[14px] outline-none focus:border-ink"
          required
          minLength={8}
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-3 text-[14px] outline-none focus:border-ink"
          required
          minLength={8}
        />
      </div>
      <button
        type="submit"
        disabled={busy || !token}
        className="h-11 w-full rounded-md bg-ink text-white text-[13px] font-semibold uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-ink/90 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Update password"} <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-center text-[12px] text-muted-foreground">
        <Link to="/" className="underline underline-offset-2 text-ink">
          Back to store
        </Link>
      </p>
    </form>
  );

  if (isDesktop) {
    return (
      <DesktopShell>
        <div className="mx-auto max-w-[640px] px-6 py-12">{form}</div>
      </DesktopShell>
    );
  }
  return (
    <MobileShell activeBottom="account" showTopTabs={false}>
      <div className="px-3 py-6">{form}</div>
    </MobileShell>
  );
}
