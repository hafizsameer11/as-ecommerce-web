import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, Smartphone, Key, Monitor, AlertTriangle, Check, LogOut } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";
import { storeAuthApi, type ApiSession } from "@/lib/api/auth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/security")({
  head: () => ({ meta: [{ title: "Security - ASL ORIGINALS" }, { name: "description", content: "Password, 2FA and active sessions." }] }),
  component: Security,
});

function formatWhen(iso: string, current?: boolean) {
  if (current) return "Active now";
  try {
    const d = new Date(iso);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 48) return `${hrs} hours ago`;
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

function Security() {
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [totpOpen, setTotpOpen] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string[] | null>(null);
  const [disabling, setDisabling] = useState(false);

  const load = useCallback(async () => {
    try {
      const [me, sess] = await Promise.all([storeAuthApi.me(), storeAuthApi.sessions()]);
      setTwoFA(!!me.twoFactorEnabled);
      setSessions(sess ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load security settings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.current || !pw.next || !pw.confirm) return toast.error("Please fill out all password fields.");
    if (pw.next !== pw.confirm) return toast.error("Passwords don't match");
    if (pw.next.length < 8) return toast.error("Password must be 8+ characters");
    try {
      await storeAuthApi.changePassword({
        currentPassword: pw.current,
        newPassword: pw.next,
        confirmPassword: pw.confirm,
      });
      toast.success("Password updated");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    }
  };

  const toggle2fa = async () => {
    if (twoFA) {
      setDisabling(true);
      setTotpCode("");
      setTotpOpen(true);
      return;
    }
    try {
      const setup = await storeAuthApi.setup2fa();
      setSetupSecret(setup.secret);
      setDisabling(false);
      setTotpCode("");
      setTotpOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start 2FA setup");
    }
  };

  const confirmTotp = async () => {
    if (totpCode.trim().length < 6) return toast.error("Enter the 6-digit code");
    try {
      if (disabling) {
        await storeAuthApi.disable2fa(totpCode.trim());
        setTwoFA(false);
        toast.success("Two-factor authentication disabled");
      } else {
        const res = await storeAuthApi.enable2fa(totpCode.trim());
        setTwoFA(true);
        setRecovery(res.recoveryCodes ?? []);
        toast.success("Two-factor authentication enabled");
      }
      setTotpOpen(false);
      setSetupSecret(null);
      setTotpCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    }
  };

  return (
    <>
      <AccountInnerScaffold title="Security" subtitle="Protect your account with strong credentials." activeId="settings" backTo="/account/settings">
        <motion.form onSubmit={(e) => void changePw(e)} variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold/10 grid place-items-center"><Key className="h-5 w-5 text-gold" /></div>
            <div><h2 className="font-display font-bold text-[15px]">Change Password</h2><p className="text-[12px] text-muted-foreground">Use at least 8 characters</p></div>
          </div>
          {(["current", "next", "confirm"] as const).map((k) => (
            <input key={k} type="password" required placeholder={k === "current" ? "Current password" : k === "next" ? "New password" : "Confirm new password"} value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/30" />
          ))}
          <button type="submit" className="h-11 px-5 rounded-md bg-ink text-white font-semibold text-[13px] hover:bg-ink/90">Update Password</button>
        </motion.form>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted grid place-items-center"><Shield className="h-5 w-5 text-ink" /></div>
              <div>
                <h2 className="font-display font-bold text-[15px]">Two-Factor Authentication</h2>
                <p className="text-[12px] text-muted-foreground">{twoFA ? "Enabled via authenticator app" : "Add an extra layer of protection"}</p>
              </div>
            </div>
            <button type="button" onClick={() => void toggle2fa()} className={`relative h-6 w-11 rounded-full ${twoFA ? "bg-ink" : "bg-border"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {twoFA && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-ink bg-muted rounded-md p-2.5">
              <Check className="h-4 w-4" /> 2FA is active. Recovery codes generated.
            </div>
          )}
          {recovery?.length ? (
            <div className="mt-3 rounded-md border border-border p-3">
              <p className="text-[12px] font-semibold mb-1">Save these recovery codes</p>
              {recovery.map((c) => (
                <p key={c} className="text-[12px] font-mono">{c}</p>
              ))}
            </div>
          ) : null}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[15px] mb-3">Active Sessions</h2>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No active sessions.</p>
            ) : (
              sessions.map((s) => {
                const Icon = /iphone|ipad|android|mobile/i.test(s.device) ? Smartphone : Monitor;
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] flex items-center gap-2">
                        {s.device}
                        {s.current && <span className="text-[9px] font-bold uppercase tracking-widest bg-ink text-white px-1.5 py-0.5 rounded">This device</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{s.location || "—"} · {formatWhen(s.lastActiveAt, s.current)}</div>
                    </div>
                    {!s.current && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await storeAuthApi.revokeSession(s.id);
                            setSessions((list) => list.filter((x) => x.id !== s.id));
                            toast.success("Session revoked");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Could not revoke session");
                          }
                        }}
                        className="text-[12px] font-semibold text-rose-600 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await storeAuthApi.revokeOtherSessions();
                await load();
                toast.success("All other sessions signed out");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not sign out sessions");
              }
            }}
            className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-rose-600 hover:underline"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out all other sessions
          </button>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <div>
              <h2 className="font-display font-bold text-[14px] text-rose-700">Danger Zone</h2>
              <p className="text-[11px] text-rose-700/70">Permanently delete your account and all data.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await storeAuthApi.deleteAccount({ confirm: "DELETE" });
                toast.success("Account deleted");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Contact support to delete your account");
              }
            }}
            className="mt-3 h-9 px-4 rounded-md border border-rose-300 bg-white text-rose-600 text-[12px] font-semibold hover:bg-rose-100"
          >
            Delete Account
          </button>
        </motion.div>
      </AccountInnerScaffold>

      <Dialog open={totpOpen} onOpenChange={setTotpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{disabling ? "Disable 2FA" : "Enable 2FA"}</DialogTitle>
          </DialogHeader>
          {!disabling && setupSecret ? (
            <p className="text-[12px] text-muted-foreground mb-2">
              Add this secret in your authenticator app:{" "}
              <span className="font-mono text-foreground">{setupSecret}</span>
            </p>
          ) : null}
          <input
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            inputMode="numeric"
            placeholder="6-digit code"
            className="w-full h-11 px-3 rounded-md border border-border bg-white text-[13px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTotpOpen(false)}>Cancel</Button>
            <Button onClick={() => void confirmTotp()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </>
  );
}
