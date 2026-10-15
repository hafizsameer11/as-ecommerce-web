import { MobileShell } from "@/components/shell/MobileShell";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/lib/catalog-product-cache";
import { goToLabel } from "@/lib/nav-resolve";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, Image as ImageIcon, AlertCircle, ChevronDown } from "lucide-react";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { trust, categoryOptions, conditionOptions, sourceOptions } from "./requestData";

const GOLD = "#cc5000";

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const },
  { id: "request", label: "Request", Icon: Plus, center: true, active: true },
  { id: "track", label: "Track", Icon: MapPin },
  { id: "account", label: "Account", Icon: User },
];

const inputCls = "w-full bg-white border border-black/10 rounded px-3 py-2.5 text-[12.5px] outline-none focus:border-gold transition placeholder:text-muted-foreground/60";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] text-ink/80 mb-1.5">{label} {required && <span className="text-gold">*</span>}</div>
      {children}
    </label>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " appearance-none pr-8"}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function MobileStartRequest({ productId }: { productId?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", category: "", size: "", colour: "", condition: "", link: "", desc: "", budget: "", source: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!productId) return;
    void fetchProductById(productId).then((p) => {
      if (!p) return;
      setForm((f) => ({
        ...f,
        name: f.name || `${p.brand} ${p.name}`.trim(),
        category: f.category || (categoryOptions.includes(p.category) ? p.category : f.category),
        link: f.link || `${typeof window !== "undefined" ? window.location.origin : ""}/product/${p.id}`,
      }));
    });
  }, [productId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error("Product name and category are required");
      return;
    }
    setBusy(true);
    try {
      const { submitConciergeRequest } = await import("@/lib/concierge-submit");
      await submitConciergeRequest(form, files, { productId });
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
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop" onBack={() => window.history.back()}>
      <div className="bg-paper pb-4">

      {/* Breadcrumb */}
      <div className="px-4 pt-4 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">Start a Request</span>
      </div>

      {/* Title */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="px-4 pt-5 pb-4 text-center">
        <h1 className="font-display font-medium text-[26px] leading-tight tracking-[0.02em] text-ink">START YOUR REQUEST</h1>
        <div className="h-[2px] w-12 bg-gold mx-auto mt-3" />
        <p className="mt-4 text-[12px] text-muted-foreground leading-relaxed">
          Tell us what you're looking for and our concierge team will source it for you. The more details you provide, the better we can help.
        </p>
      </motion.section>

      {/* Trust icons row */}
      <section className="px-3 mt-2">
        <div className="grid grid-cols-4 border-y border-black/10 py-4">
          {trust.map(({ Icon, title }, i) => (
            <div key={title} className={`flex flex-col items-center text-center px-1 ${i > 0 ? "border-l border-black/10" : ""}`}>
              <div className="h-10 w-10 rounded-full border border-ink grid place-items-center mb-1.5">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="text-[8.5px] font-bold tracking-[0.08em] text-ink leading-tight whitespace-pre-line">{title.replace(" ", "\n")}</div>
            </div>
          ))}
        </div>
      </section>


      {/* Form */}
      <form onSubmit={(e) => void onSubmit(e)}
        className="px-4 pt-8 space-y-6">
        {/* Item details */}
        <div>
          <h2 className="text-[12px] font-bold tracking-[0.18em] text-ink mb-4">1. ITEM DETAILS</h2>
          <div className="space-y-3.5">
            <Field label="Product Name / Brand" required>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Air Jordan 1 Retro High OG" className={inputCls} required />
            </Field>
            <Field label="Category" required>
              <Select value={form.category} onChange={(v) => set("category", v)} placeholder="Select Category" options={categoryOptions} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Size">
                <Select value={form.size} onChange={(v) => set("size", v)} placeholder="Select Size" options={["XS","S","M","L","XL","EU 40","EU 42","EU 44"]} />
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
              <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Add any specific details about the item..." rows={3} className={inputCls + " resize-none"} />
            </Field>
          </div>
        </div>

        {/* Upload */}
        <div>
          <h2 className="text-[12px] font-bold tracking-[0.18em] text-ink mb-2">2. UPLOAD IMAGE <span className="text-muted-foreground font-normal tracking-[0.1em]">(OPTIONAL)</span></h2>
          <p className="text-[11px] text-muted-foreground mb-3">Upload clear photos or screenshots of the item you are looking for.</p>
          <label className="block border-2 border-dashed border-black/15 rounded-lg bg-white/60 cursor-pointer p-8 text-center">
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
            <ImageIcon className="h-7 w-7 mx-auto text-muted-foreground/70 mb-2" strokeWidth={1.5} />
            <div className="text-[12px] text-ink"><span className="font-semibold">Click to upload</span> or drag and drop</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {files.length ? `${files.length} selected · ` : ""}PNG, JPG up to 10MB
            </div>
          </label>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-[12px] font-bold tracking-[0.18em] text-ink mb-4">3. YOUR PREFERENCES</h2>
          <div className="space-y-3.5">
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

        {/* Important */}
        <div className="rounded border border-[#e6d9be] bg-[#faf3e3] p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="h-4 w-4 text-gold" strokeWidth={2} />
            <div className="text-[11px] font-bold tracking-[0.14em] text-ink">IMPORTANT INFORMATION</div>
          </div>
          <ul className="text-[11px] text-ink/80 space-y-1.5 leading-relaxed list-disc pl-5">
            <li>We will review your request and get back to you within 24 - 48 hours.</li>
            <li>Prices vary based on availability, demand, and market value.</li>
            <li>Payment is required before we secure your item.</li>
            <li>By submitting this request, you agree to our Terms & Conditions.</li>
          </ul>
        </div>

        <motion.button whileTap="tap" variants={buttonTap} type="submit"
          disabled={busy}
          className="w-full bg-ink text-white py-3.5 text-[11.5px] font-semibold tracking-[0.22em] rounded disabled:opacity-60">
          {busy ? "SUBMITTING…" : "SUBMIT REQUEST"}
        </motion.button>
      </form>

      </div>
    </MobileShell>
  );
}
