import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Phone, MessageCircle, MapPin, ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { useTickets, type TicketCategory } from "@/lib/tickets-store";

export const Route = createFileRoute("/customer-care/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us - ASL ORIGINALS" },
      { name: "description", content: "Speak with the ASL ORIGINALS client care team by WhatsApp, phone, email or by appointment at our Lagos atelier." },
      { property: "og:title", content: "Contact Us - ASL ORIGINALS" },
      { property: "og:description", content: "Speak with the ASL ORIGINALS client care team by WhatsApp, phone, email or by appointment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactUs,
});

const channels = [
  {
    Icon: MessageCircle,
    index: "01",
    label: "WhatsApp",
    value: "+234 800 ASL LUXE",
    note: "Fastest reply · ~10 mins",
    action: () => toast("Opening WhatsApp…"),
  },
  {
    Icon: Phone,
    index: "02",
    label: "Call Us",
    value: "+234 800 275 5893",
    note: "Mon - Sun, 9AM - 8PM WAT",
    action: () => toast("Calling…"),
  },
  {
    Icon: Mail,
    index: "03",
    label: "Email",
    value: "customerservice@asloriginals.com",
    note: "Reply within 24 hours",
    action: () => toast("Opening mail…"),
  },
  {
    Icon: MapPin,
    index: "04",
    label: "Visit the Atelier",
    value: "Lekki Phase 1, Lagos",
    note: "By appointment only",
    action: () => toast("Opening map…"),
  },
];

const subjectToCategory: Record<string, TicketCategory> = {
  "Order Issue": "order",
  "Return & Refund": "returns",
  Payment: "payment",
  Shipping: "delivery",
  "General Inquiry": "other",
};

const fieldCls =
  "w-full bg-transparent border-0 border-b border-ink/15 rounded-none px-0 py-2.5 text-[14px] text-ink placeholder:text-ink/25 focus:outline-none focus:border-gold transition-colors";

function ContactUs() {
  const nav = useNavigate();
  const contact = useTickets((s) => s.contact);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [doneId, setDoneId] = useState<string | null>(null);
  const [doneRef, setDoneRef] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!form.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.subject) errors.subject = "Please select a subject.";
  if (form.message.trim().length < 5) errors.message = "Please tell us a little more (at least 5 characters).";
  const show = (k: string) => (submitted ? errors[k] : undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setSubmitted(true);
      toast.error("Please fill in the highlighted fields.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const created = await contact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
      setDoneId(created.id);
      setDoneRef(created.reference);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setBusy(false);
    }
  };

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-1.5 text-[11.5px] font-medium text-red-600">{msg}</p> : null;


  return (
    <CustomerCareScaffold
      activeId="contact-us"
      title="Contact Us"
      subtitle="Experience dedicated support at every stage of your journey with ASL ORIGINALS. From product enquiries and order updates to after purchase assistance, our team is committed to delivering prompt, professional, and personalized service."
      showHero={false}
    >
      {/* Concierge masthead */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-lg bg-ink text-white px-6 py-8 md:px-10 md:py-12"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-6 top-16 h-40 w-40 rounded-full border border-gold/25" />
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Client Services</p>
        <h2 className="mt-4 font-display text-[30px] md:text-[42px] leading-[1.05] font-bold max-w-lg">
          A personal line to the house.
        </h2>
        <p className="mt-3 text-[13px] md:text-[14px] leading-relaxed text-white/65 max-w-md">
          Sourcing, sizing, authentication or aftercare - a dedicated advisor will attend to your request.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={channels[0].action}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-ink text-[12px] font-bold uppercase tracking-[0.15em] active:scale-[0.98] transition-transform"
          >
            Chat on WhatsApp <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={channels[1].action}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/25 text-white text-[12px] font-bold uppercase tracking-[0.15em] hover:border-gold hover:text-gold transition-colors"
          >
            Call an advisor
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
          {[
            { k: "Few mins", v: "reply time" },
            { k: "24/7", v: "coverage" },
            { k: "1:1", v: "advisor" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-display text-[20px] md:text-[24px] font-bold text-gold leading-none">{s.k}</div>
              <div className="mt-1.5 text-[9.5px] uppercase tracking-[0.2em] text-white/45">{s.v}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Channel list */}
      <section className="rounded-lg border border-border bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Direct Channels</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Choose one</span>
        </div>
        <div className="divide-y divide-border">
          {channels.map((c, i) => (
            <motion.button
              key={c.label}
              onClick={c.action}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              className="group w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-ink/25 w-5">{c.index}</span>
              <span className="h-10 w-10 shrink-0 rounded-full border border-ink/10 grid place-items-center group-hover:border-gold transition-colors">
                <c.Icon className="h-4 w-4 text-ink" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.label}</span>
                <span className="block mt-1 text-[14px] font-semibold text-ink leading-snug truncate">{c.value}</span>
                <span className="block mt-0.5 text-[11px] text-muted-foreground">{c.note}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink/30 group-hover:text-gold transition-colors" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Stationery form */}
      <section className="rounded-lg border border-border bg-white p-5 md:p-8">
        <div className="flex items-baseline justify-between border-b border-border pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Written Inquiry</p>
            <h2 className="mt-2 font-display text-[22px] md:text-[28px] font-bold leading-tight">Send us a message</h2>
          </div>
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ref. ASL/CC</span>
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Name</label>
              <input
                value={form.name}
                aria-invalid={!!show("name")}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className={`${fieldCls} ${show("name") ? "border-red-500" : ""}`}
              />
              <ErrorText msg={show("name")} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Email</label>
              <input
                type="email"
                value={form.email}
                aria-invalid={!!show("email")}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                className={`${fieldCls} ${show("email") ? "border-red-500" : ""}`}
              />
              <ErrorText msg={show("email")} />
            </div>
          </div>


          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Subject</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(subjectToCategory).map((s) => {
                const active = form.subject === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, subject: s })}
                    className={`h-9 px-4 rounded-full text-[11.5px] font-semibold border transition-colors ${
                      active ? "bg-ink text-white border-ink" : "border-ink/15 text-ink/70 hover:border-ink/40"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {show("subject") ? (
              <ErrorText msg={show("subject")} />
            ) : (
              !form.subject && <p className="mt-2 text-[11px] text-muted-foreground">Select a topic to continue.</p>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Message</label>
            <textarea
              rows={5}
              value={form.message}
              aria-invalid={!!show("message")}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us how we can help…"
              className={`${fieldCls} resize-none ${show("message") ? "border-red-500" : ""}`}
            />
            <ErrorText msg={show("message")} />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="group w-full md:w-auto inline-flex items-center justify-center gap-3 h-12 px-8 rounded-full bg-ink text-white text-[11.5px] font-bold uppercase tracking-[0.22em] active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send Message"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </section>

      {/* Hours */}
      <section className="rounded-lg border border-border bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Support Hours</p>
          <p className="mt-1.5 text-[12.5px] text-foreground/80">
            Monday - Saturday: 9:00 AM - 8:00 PM (WAT) · Sunday: 9:00 AM - 8:00 PM (WAT)
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ink/70">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          Advisors online
        </span>
      </section>

      {doneId && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/60 px-5">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-ink grid place-items-center">
              <Check className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 text-[18px] font-bold uppercase tracking-[0.14em]">Request Received</h3>
            <p className="mt-3 text-[13px] font-semibold text-ink">Thank you for contacting ASL ORIGINALS.</p>
            <p className="mt-2 text-[12.5px] text-muted-foreground leading-relaxed">
              Your request has been successfully submitted. A member of our Client Support team
              will be in touch within 24 hours.
            </p>
            <div className="mt-4 rounded-lg border border-ink/10 bg-secondary/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Reference: {doneRef ?? doneId}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                Please keep this reference number for any future correspondence regarding your request.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => nav({ to: "/account/tickets/$id", params: { id: doneId } })}
                className="w-full h-11 rounded-full bg-ink text-white text-[11.5px] font-bold uppercase tracking-[0.2em]"
              >
                Track Ticket
              </button>
              <button
                onClick={() => nav({ to: "/shop" })}
                className="w-full h-11 rounded-full border border-ink/15 text-ink text-[11.5px] font-bold uppercase tracking-[0.2em]"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </CustomerCareScaffold>

  );
}
