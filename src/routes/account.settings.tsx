import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft, Bell, Mail, MessageSquare, Globe, Shield, Lock, Eye, LogOut, Trash2, ChevronRight, LucideIcon,
} from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { fadeInUp } from "@/lib/motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import { storeAuthApi } from "@/lib/api/auth";
import { cmsApi } from "@/lib/api/cms";

export const Route = createFileRoute("/account/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings - ASL ORIGINALS" },
      { name: "description", content: "Manage your preferences, notifications, privacy, and security." },
      { property: "og:title", content: "Account Settings - ASL ORIGINALS" },
      { property: "og:description", content: "Manage preferences, notifications, privacy, and security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <Desktop /> : <Mobile />}
      <Toaster position="top-center" />
    </>
  );
}

function Toggle({
  label,
  desc,
  Icon,
  defaultOn = false,
  on: controlledOn,
  onChange,
}: {
  label: string;
  desc: string;
  Icon: LucideIcon;
  defaultOn?: boolean;
  on?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [localOn, setLocalOn] = useState(defaultOn);
  const on = controlledOn ?? localOn;
  const setOn = (v: boolean) => {
    if (onChange) onChange(v);
    else setLocalOn(v);
  };
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
      <Icon className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]">{label}</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors shrink-0 ${on ? "bg-ink border-ink" : "bg-muted border-border"}`}
        aria-label={label}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[calc(100%+8px)]" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

const CURRENCY_OPTS = ["NGN (₦)", "USD ($)", "EUR (€)", "GBP (£)", "GHS (₵)", "KES (KSh)"];
const currencyCode = (label: string) => label.split(" ")[0] || "NGN";
const currencyLabel = (code?: string) => CURRENCY_OPTS.find((o) => o.startsWith(code || "NGN")) || "NGN (₦)";

function Row({ label, desc, Icon, value, onClick, danger }: { label: string; desc: string; Icon: LucideIcon; value?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 py-3.5 border-b border-border last:border-0 text-left hover:bg-muted/20 -mx-4 px-4 transition-colors ${danger ? "text-rose-600" : ""}`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px]">{label}</div>
        <div className={`text-[12px] mt-0.5 ${danger ? "text-rose-600/70" : "text-muted-foreground"}`}>{desc}</div>
      </div>
      {value && <div className="text-[13px] text-muted-foreground shrink-0">{value}</div>}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-3 px-1">{title}</h2>
      <div className="rounded-2xl border border-border bg-white px-4">{children}</div>
    </motion.div>
  );
}

function Body() {
  const nav = useNavigate();
  const { signOut } = useAuth();
  const [lang, setLang] = useState("English");
  const [currency, setCurrency] = useState("NGN (₦)");
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [privOpen, setPrivOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState("");

  const [analytics, setAnalytics] = useState(true);
  const [personalize, setPersonalize] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  useEffect(() => {
    void storeAuthApi
      .me()
      .then((me) => {
        setLang(me.preferences?.language || "English");
        setCurrency(currencyLabel(me.preferences?.currency));
        setAnalytics(me.preferences?.privacy?.analytics ?? true);
        setPersonalize(me.preferences?.privacy?.personalization ?? true);
        setMarketing(me.preferences?.privacy?.marketingCookies ?? false);
      })
      .catch(() => {});
    void cmsApi
      .notificationPreferences()
      .then((prefs) => {
        setNotifPush(prefs.channels.push);
        setNotifEmail(prefs.channels.email);
        setNotifSms(prefs.channels.sms);
      })
      .catch(() => {});
  }, []);

  const savePrefs = async (patch: {
    language?: string;
    currency?: string;
    privacy?: { analytics: boolean; personalization: boolean; marketingCookies: boolean };
  }) => {
    try {
      await storeAuthApi.updatePreferences({
        language: patch.language,
        currency: patch.currency ? currencyCode(patch.currency) : undefined,
        privacy: patch.privacy,
      });
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save preferences");
    }
  };

  const toggleNotif = async (key: "push" | "email" | "sms", next: boolean) => {
    const setters = { push: setNotifPush, email: setNotifEmail, sms: setNotifSms };
    const prev = { push: notifPush, email: notifEmail, sms: notifSms };
    setters[key](next);
    try {
      await cmsApi.updateNotificationPreferences({ channels: { [key]: next } });
    } catch (err) {
      setters[key](prev[key]);
      toast.error(err instanceof Error ? err.message : "Could not update notification preference");
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Notifications">
        <Toggle label="Push Notifications" desc="Order updates, offers, and news" Icon={Bell} on={notifPush} onChange={(v) => void toggleNotif("push", v)} />
        <Toggle label="Email Notifications" desc="Weekly newsletter and promotions" Icon={Mail} on={notifEmail} onChange={(v) => void toggleNotif("email", v)} />
        <Toggle label="SMS Notifications" desc="Delivery and order status updates" Icon={MessageSquare} on={notifSms} onChange={(v) => void toggleNotif("sms", v)} />
      </Section>

      <Section title="Preferences">
        <Row label="Language" desc="Choose your preferred language" Icon={Globe} value={lang} onClick={() => setLangOpen(true)} />
        <Row label="Currency" desc="Display prices in your currency" Icon={Globe} value={currency} onClick={() => setCurrOpen(true)} />
      </Section>

      <Section title="Privacy & Security">
        <Row label="Change Password" desc="Update your account password" Icon={Lock} onClick={() => nav({ to: "/account/security" })} />
        <Row label="Two-Factor Authentication" desc="Extra layer of protection" Icon={Shield} value="Off" onClick={() => nav({ to: "/account/security" })} />
        <Row label="Privacy Settings" desc="Control your data & visibility" Icon={Eye} onClick={() => setPrivOpen(true)} />
      </Section>

      <Section title="Account">
        <Row label="Log Out" desc="Sign out of your account" Icon={LogOut} onClick={() => setLogoutOpen(true)} />
        <Row label="Delete Account" desc="Permanently remove your account" Icon={Trash2} danger onClick={() => setDelOpen(true)} />
      </Section>

      <div className="text-center text-[11px] text-muted-foreground pt-2">ASL ORIGINALS · Version 1.0.0</div>

      {/* Language */}
      <Dialog open={langOpen} onOpenChange={setLangOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Language</DialogTitle><DialogDescription>Choose your preferred language.</DialogDescription></DialogHeader>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["English", "Français", "Español", "Português", "Yoruba", "Igbo", "Hausa"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter><Button onClick={() => { setLangOpen(false); void savePrefs({ language: lang }); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Currency */}
      <Dialog open={currOpen} onOpenChange={setCurrOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Currency</DialogTitle><DialogDescription>Display prices in your currency.</DialogDescription></DialogHeader>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["NGN (₦)", "USD ($)", "EUR (€)", "GBP (£)", "GHS (₵)", "KES (KSh)"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter><Button onClick={() => { setCurrOpen(false); void savePrefs({ currency }); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy */}
      <Dialog open={privOpen} onOpenChange={setPrivOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Privacy Settings</DialogTitle><DialogDescription>Control how your data is used.</DialogDescription></DialogHeader>
          <div className="space-y-1">
            <Toggle label="Analytics" desc="Help us improve with anonymous usage data" Icon={Eye} on={analytics} onChange={setAnalytics} />
            <Toggle label="Personalization" desc="Tailor recommendations to your taste" Icon={Eye} on={personalize} onChange={setPersonalize} />
            <Toggle label="Marketing Cookies" desc="Ads relevant to your interests" Icon={Eye} on={marketing} onChange={setMarketing} />
          </div>
          <DialogFooter><Button onClick={() => { setPrivOpen(false); void savePrefs({ privacy: { analytics, personalization: personalize, marketingCookies: marketing } }); }}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log out</DialogTitle><DialogDescription>You'll need to sign in again to access your account.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button onClick={() => { signOut(); setLogoutOpen(false); toast.success("Signed out"); nav({ to: "/" }); }}>Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={delOpen} onOpenChange={(o) => { setDelOpen(o); if (!o) setDelText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600">Delete Account</DialogTitle>
            <DialogDescription>This is permanent. All orders, rewards, wallet balance and saved data will be removed. Type <strong>DELETE</strong> to confirm.</DialogDescription>
          </DialogHeader>
          <input
            value={delText}
            onChange={(e) => setDelText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button
              disabled={delText !== "DELETE"}
              onClick={() => { setDelOpen(false); signOut(); toast.success("Account deletion requested"); nav({ to: "/" }); }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Desktop() {
  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="settings" />
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="font-display text-3xl font-bold">Account Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your preferences and account security.</p>
          </div>
          <Body />
        </div>
      </div>
    </DesktopShell>
  );
}

function Mobile() {
  const nav = useNavigate();
  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-[15px]">Settings</h1>
          <div className="w-5" />
        </div>
      </div>
      <div className="px-3 py-4">
        <Body />
      </div>
    </MobileShell>
  );
}
