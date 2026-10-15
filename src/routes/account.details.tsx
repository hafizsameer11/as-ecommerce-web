import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Camera, Crown, Pencil } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { COUNTRY_CODES, PRIORITY_ISOS } from "@/lib/country-codes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeAuthApi, type CustomerDto } from "@/lib/api/auth";
import { syncAuthUserFromCustomer } from "@/lib/auth-store";

export const Route = createFileRoute("/account/details")({
  head: () => ({
    meta: [
      { title: "Account Details - ASL ORIGINALS" },
      { name: "description", content: "Manage your personal information on ASL ORIGINALS." },
      { property: "og:title", content: "Account Details - ASL ORIGINALS" },
      { property: "og:description", content: "Manage your personal information." },
    ],
  }),
  component: DetailsPage,
});

const GENDER_OPTS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function initials(c: CustomerDto) {
  const a = (c.firstName?.[0] || "") + (c.lastName?.[0] || "");
  return (a || c.email?.[0] || "?").toUpperCase();
}

function DetailsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <Desktop /> : <Mobile />}
      <Toaster position="top-center" />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-[14px] focus:outline-none focus:border-ink disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60"
      />
    </div>
  );
}

function Flag({ iso, className }: { iso: string; className?: string }) {
  return (
    <span
      className={cn(
        "fi fi-" + iso.toLowerCase(),
        "inline-block h-3 w-[18px] rounded-[2px] bg-muted bg-center bg-no-repeat",
        className
      )}
    />
  );
}

function PhoneField({
  disabled,
  iso,
  setIso,
  num,
  setNum,
}: {
  disabled: boolean;
  iso: string;
  setIso: (v: string) => void;
  num: string;
  setNum: (v: string) => void;
}) {
  const selected = COUNTRY_CODES.find((c) => c.iso === iso)!;
  const priority = PRIORITY_ISOS.map((i) => COUNTRY_CODES.find((c) => c.iso === i)!);
  const rest = COUNTRY_CODES.filter((c) => !PRIORITY_ISOS.includes(c.iso));
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        Phone
      </label>
      <div className="flex gap-2">
        <Select value={iso} onValueChange={setIso} disabled={disabled}>
          <SelectTrigger className="w-auto min-w-[104px] shrink-0 h-11 px-3 rounded-md border border-border bg-white text-[14px] gap-1.5 disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <Flag iso={selected.iso} />
              <span className="tabular-nums">{selected.dial}</span>
            </span>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {priority.map((c) => (
              <SelectItem key={c.iso} value={c.iso} textValue={`${c.name} ${c.dial}`} className="py-2">
                <span className="flex items-center gap-2.5 min-w-0">
                  <Flag iso={c.iso} />
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto tabular-nums text-muted-foreground">{c.dial}</span>
                </span>
              </SelectItem>
            ))}
            {rest.map((c) => (
              <SelectItem key={c.iso} value={c.iso} textValue={`${c.name} ${c.dial}`} className="py-2">
                <span className="flex items-center gap-2.5 min-w-0">
                  <Flag iso={c.iso} />
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto tabular-nums text-muted-foreground">{c.dial}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="tel"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          disabled={disabled}
          className="w-full min-w-0 h-11 px-3.5 rounded-md border border-border bg-white text-[14px] focus:outline-none focus:border-ink disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60"
        />
      </div>
    </div>
  );
}

function Form() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<CustomerDto | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [iso, setIso] = useState("NG");
  const [num, setNum] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const apply = useCallback((c: CustomerDto) => {
    setProfile(c);
    setFirstName(c.firstName || "");
    setLastName(c.lastName || "");
    setIso(c.phoneCountry || "NG");
    setNum((c.phone || "").replace(/^\+\d{1,3}\s?/, "").replace(/^0/, ""));
    setDob(c.dateOfBirth || "");
    setGender(c.gender || "prefer_not_to_say");
  }, []);

  useEffect(() => {
    void storeAuthApi
      .me()
      .then(apply)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load profile"));
  }, [apply]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const dial = COUNTRY_CODES.find((c) => c.iso === iso)?.dial ?? "+234";
      const phone = num.trim() ? `${dial} ${num.trim()}` : null;
      const updated = await storeAuthApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        phoneCountry: iso,
        dateOfBirth: dob.trim() || null,
        gender: gender as CustomerDto["gender"],
      });
      apply(updated);
      syncAuthUserFromCustomer(updated);
      setEditing(false);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const onPhotoPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const updated = await storeAuthApi.uploadAvatar(file);
      apply(updated);
      syncAuthUserFromCustomer(updated);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo");
    }
  };

  if (!profile) {
    return <p className="text-[13px] text-muted-foreground">Loading profile…</p>;
  }

  const tier = profile.tier || "Standard";
  const displayName = profile.name || profile.email;

  return (
    <motion.form
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      onSubmit={save}
      className="rounded-2xl border border-border bg-white p-6 space-y-5"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onPhotoPick(e.target.files?.[0])}
      />
      <div className="flex items-center gap-4">
        <div className="relative">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="h-20 w-20 rounded-full object-cover bg-muted"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-ink text-white grid place-items-center font-display font-bold text-2xl">
              {initials(profile)}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gold text-ink grid place-items-center border-2 border-white"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <div className="font-display font-bold text-lg">{displayName}</div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded mt-1">
            <Crown className="h-3 w-3" /> {tier} Member
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-auto inline-flex items-center gap-1.5 border border-border text-[11px] font-semibold uppercase tracking-widest px-3.5 py-2 rounded-md hover:bg-muted/40"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" value={firstName} onChange={setFirstName} disabled={!editing} />
          <Field label="Last Name" value={lastName} onChange={setLastName} disabled={!editing} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full h-11 px-3.5 rounded-md border border-border/60 bg-muted/40 text-[14px] text-muted-foreground"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">Your email address cannot be changed.</p>
        </div>
        <PhoneField disabled={!editing} iso={iso} setIso={setIso} num={num} setNum={setNum} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of Birth" value={dob} onChange={setDob} type="date" disabled={!editing} />
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={!editing}
              className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-[14px] focus:outline-none focus:border-ink disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60 disabled:appearance-none"
            >
              {GENDER_OPTS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {editing && (
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 bg-ink text-white text-[13px] font-semibold py-3 rounded-md hover:bg-ink/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              apply(profile);
              setEditing(false);
              toast("Changes discarded");
            }}
            className="px-6 border border-border text-[13px] font-semibold py-3 rounded-md hover:bg-muted/40"
          >
            Cancel
          </button>
        </div>
      )}
    </motion.form>
  );
}

function Desktop() {
  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="details" />
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="font-display text-3xl font-bold">Account Details</h1>
            <p className="text-sm text-muted-foreground mt-1">Update your personal information.</p>
          </div>
          <Form />
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
          <button onClick={() => nav({ to: "/account" })} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display font-bold text-[15px]">Account Details</h1>
          <div className="w-5" />
        </div>
      </div>
      <div className="px-3 py-4">
        <Form />
      </div>
    </MobileShell>
  );
}
