import { useState } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag, Search, User, Image as ImageIcon, AlertCircle, ChevronDown } from "lucide-react";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { trust, categoryOptions, conditionOptions, sourceOptions } from "./requestData";
import heroImg from "@/assets/request-hero.jpg";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const, active: true },
  { label: "CATEGORIES", to: "/concierge-categories" as const },
  { label: "HOW IT WORKS", to: "/how-it-works" as const },
  { label: "TRACK REQUEST", to: "/track-request" as const },
  { label: "FAQ" },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] text-ink/80 mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls = "w-full bg-white border border-black/10 rounded px-3 py-2.5 text-[12.5px] outline-none focus:border-gold transition placeholder:text-muted-foreground/60";
const selectCls = inputCls + " appearance-none pr-8";

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function DesktopStartRequest() {
  const [form, setForm] = useState({ name: "", category: "", size: "", colour: "", condition: "", link: "", desc: "", budget: "", source: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error("Product name and category are required");
      return;
    }
    setBusy(true);
    try {
      const { submitConciergeRequest } = await import("@/lib/concierge-submit");
      await submitConciergeRequest(form, files);
      toast.success("Request submitted - we'll get back to you within 24 - 48 hours");
      setForm({ name: "", category: "", size: "", colour: "", condition: "", link: "", desc: "", budget: "", source: "", notes: "" });
      setFiles([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-ink text-white sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <div className="font-display font-bold text-lg tracking-[0.18em] leading-none">ASL ORIGINALS</div>
            <div className="text-[9px] tracking-[0.3em] text-white/60 mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => {
              const cls = `text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-white border-b-2 border-gold pb-5 -mb-[17px]" : "text-white/70 hover:text-white"}`;
              if (n.to) return <Link key={n.label} to={n.to} className={cls}>{n.label}</Link>;
              return <button key={n.label} onClick={() => goToLabel(n.label)} className={cls}>{n.label}</button>;
            })}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => goToLabel("Search")} aria-label="Search"><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Account")} aria-label="Account"><User className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap}
              className="border border-gold text-gold px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded">
              START A REQUEST
            </motion.button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1600px] px-6 pt-6 text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-2">›</span>
        <span className="text-ink">Start a Request</span>
      </div>

      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mx-auto max-w-[1600px] px-6 pt-6">
        <div className="relative rounded-xl overflow-hidden bg-[#f5efe4]">
          <img src={heroImg} alt="Luxury items" className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-left" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] from-30% via-[#f5efe4]/80 via-45% to-transparent to-65%" />
          <div className="relative grid grid-cols-2 gap-10 items-center">
            <div className="pl-10 py-14">
              <h1 className="font-display font-medium text-[54px] leading-[1.02] tracking-[0.02em] text-ink">START YOUR REQUEST</h1>
              <div className="h-[3px] w-16 bg-gold mt-4" />
              <p className="mt-5 text-[13.5px] text-muted-foreground leading-relaxed max-w-md">
                Tell us what you're looking for and our concierge team will source it for you.<br />
                The more details you provide, the better we can help.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trust bar */}
      <section className="mx-auto max-w-[1600px] px-6 mt-10">
        <div className="border-y border-black/10 py-6 grid grid-cols-4">
          {trust.map(({ Icon, title, sub }, i) => (
            <div key={title} className={`flex items-start gap-3 px-6 ${i > 0 ? "border-l border-black/10" : ""}`}>
              <div className="h-10 w-10 rounded-full border border-ink grid place-items-center shrink-0">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] text-ink">{title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Form */}
      <form onSubmit={(e) => void onSubmit(e)}
        className="mx-auto max-w-[1600px] px-6 pt-10 pb-14">
        <div className="grid grid-cols-2 gap-14">
          {/* Left column */}
          <div>
            <h2 className="text-[13px] font-bold tracking-[0.18em] text-ink mb-5">1. ITEM DETAILS</h2>
            <div className="space-y-4">
              <Field label="Product Name / Brand" required>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Air Jordan 1 Retro High OG" className={inputCls} required />
              </Field>
              <Field label="Category" required>
                <Select value={form.category} onChange={(v) => set("category", v)} placeholder="Select Category" options={categoryOptions} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Size">
                  <Select value={form.size} onChange={(v) => set("size", v)} placeholder="Select Size" options={["XS","S","M","L","XL","XXL","EU 38","EU 40","EU 42","EU 44","EU 46"]} />
                </Field>
                <Field label="Colour">
                  <input value={form.colour} onChange={(e) => set("colour", e.target.value)} placeholder="Select Colour" className={inputCls} />
                </Field>
              </div>
              <Field label="Condition (If known)">
                <Select value={form.condition} onChange={(v) => set("condition", v)} placeholder="Select Condition" options={conditionOptions} />
              </Field>
              <Field label="Please share a link (if available)">
                <input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="Paste product link here" className={inputCls} />
              </Field>
              <Field label="Describe your item in more detail (optional)">
                <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Add any specific details about the item you want..." rows={4} className={inputCls + " resize-none"} />
              </Field>
            </div>
          </div>

          {/* Right column */}
          <div>
            <h2 className="text-[13px] font-bold tracking-[0.18em] text-ink mb-2">2. UPLOAD IMAGE <span className="text-muted-foreground font-normal tracking-[0.1em]">(OPTIONAL)</span></h2>
            <p className="text-[11.5px] text-muted-foreground mb-4">Upload clear photos or screenshots of the item you are looking for.</p>
            <label className="block border-2 border-dashed border-black/15 rounded-lg bg-white/60 hover:bg-white transition cursor-pointer p-10 text-center">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const next = Array.from(e.target.files ?? []).slice(0, 6);
                  setFiles(next);
                  if (next.length) toast.success(`${next.length} file${next.length > 1 ? "s" : ""} selected`);
                }}
              />
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/70 mb-3" strokeWidth={1.5} />
              <div className="text-[12.5px] text-ink"><span className="font-semibold">Click to upload</span> or drag and drop</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {files.length ? `${files.length} selected · ` : ""}PNG, JPG up to 10MB
              </div>
            </label>

            <h2 className="text-[13px] font-bold tracking-[0.18em] text-ink mt-8 mb-5">3. YOUR PREFERENCES</h2>
            <div className="space-y-4">
              <Field label="Target Budget (Optional)">
                <input value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. ₦100,000" className={inputCls} />
              </Field>
              <Field label="Where did you see this item?">
                <Select value={form.source} onChange={(v) => set("source", v)} placeholder="Select an option" options={sourceOptions} />
              </Field>
              <Field label="Any additional notes (optional)">
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Add any additional information..." rows={3} className={inputCls + " resize-none"} />
              </Field>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 grid grid-cols-2 gap-14 items-start">
          <div className="rounded border border-[#e6d9be] bg-[#faf3e3] p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-gold" strokeWidth={2} />
              <div className="text-[11.5px] font-bold tracking-[0.14em] text-ink">IMPORTANT INFORMATION</div>
            </div>
            <ul className="text-[11.5px] text-ink/80 space-y-1.5 leading-relaxed list-disc pl-5">
              <li>We will review your request and get back to you within 24 - 48 hours.</li>
              <li>Prices vary based on availability, demand, and market value.</li>
              <li>Payment is required before we secure your item.</li>
              <li>By submitting this request, you agree to our Terms & Conditions.</li>
            </ul>
          </div>
          <div className="flex items-end h-full">
            <motion.button whileHover={{ scale: 1.01 }} whileTap="tap" variants={buttonTap} type="submit"
              disabled={busy}
              className="w-full bg-ink text-white py-4 text-[12px] font-semibold tracking-[0.22em] rounded disabled:opacity-60">
              {busy ? "SUBMITTING…" : "SUBMIT REQUEST"}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
