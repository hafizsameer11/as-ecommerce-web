import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  Check,
  Package,
  RotateCcw,
  Wand2,
  Wallet,
  User,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { useTickets, type TicketCategory } from "@/lib/tickets-store";

export const Route = createFileRoute("/account/help/contact")({
  head: () => ({ meta: [{ title: "Contact Support - ASL ORIGINALS" }, { name: "description", content: "Reach the ASL ORIGINALS support team." }] }),
  component: Contact,
});

const topics: { label: string; category: TicketCategory; Icon: LucideIcon }[] = [
  { label: "Order Issue", category: "order", Icon: Package },
  { label: "Return & Refund", category: "returns", Icon: RotateCcw },
  { label: "Concierge Request", category: "concierge", Icon: Wand2 },
  { label: "Payment & Wallet", category: "payment", Icon: Wallet },
  { label: "Account & Login", category: "account", Icon: User },
  { label: "Other", category: "other", Icon: HelpCircle },
];

const channels = [
  { id: "whatsapp", label: "WhatsApp", value: "Chat now · ~10 min reply", Icon: MessageCircle, action: () => toast("Opening WhatsApp…") },
  { id: "call", label: "Phone", value: "+234 800 ASL LUXE", Icon: Phone, action: () => toast("Calling…") },
  { id: "email", label: "Email", value: "customerservice@asloriginals.com", Icon: Mail, action: () => toast("Opening mail…") },
];

function Contact() {
  const nav = useNavigate();
  const createFromCustomer = useTickets((s) => s.createFromCustomer);
  const [topic, setTopic] = useState<string>("");
  const [message, setMessage] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);
  const [doneRef, setDoneRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const selected = topics.find((t) => t.label === topic);
  const topicError = !topic ? "Please choose what we can help with." : "";
  const messageError = message.trim().length < 5 ? "Please describe your issue (at least 5 characters)." : "";
  const canSend = !topicError && !messageError;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) {
      setSubmitted(true);
      toast.error("Please fill in the highlighted fields.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const created = await createFromCustomer({
        subject: topic,
        body: message,
        category: selected?.category ?? "other",
        channel: "web",
      });
      setTopic("");
      setMessage("");
      setSubmitted(false);
      setDoneId(created.id);
      setDoneRef(created.reference);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold title="Contact Support" activeId="help" backTo="/account/help" maxWidth="max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ---- Guided request ---- */}
          <form onSubmit={submit} className="space-y-5">
            {/* Step 01 */}
            <section>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[13px] font-bold text-gold tabular-nums">01</span>
                <h2 className="font-display text-[17px] font-bold tracking-tight">What can we help with?</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {topics.map((t) => {
                  const active = topic === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTopic(t.label)}
                      className={`relative rounded-md border p-2.5 text-left transition-all ${
                        active
                          ? "border-gold bg-gold/[0.07] shadow-[0_0_0_1px_var(--color-gold)]"
                          : "border-border bg-white hover:border-ink/25"
                      }`}
                    >
                      <t.Icon className={`h-[18px] w-[18px] ${active ? "text-gold" : "text-muted-foreground"}`} strokeWidth={1.7} />
                      <div className="mt-2.5 text-[12px] font-semibold leading-snug">{t.label}</div>
                      {active && (
                        <span className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-gold grid place-items-center">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {submitted && topicError && (
                <p className="mt-2 text-[11.5px] font-medium text-red-600">{topicError}</p>
              )}
            </section>

            {/* Step 02 */}
            <section>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[13px] font-bold text-gold tabular-nums">02</span>
                <h2 className="font-display text-[17px] font-bold tracking-tight">Tell us the details</h2>
              </div>
              <div className={`mt-3 rounded-md border bg-white overflow-hidden ${submitted && messageError ? "border-red-500" : "border-border"}`}>
                <textarea
                  aria-invalid={submitted && !!messageError}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={
                    topic === "Order Issue"
                      ? "Share your order number and what went wrong…"
                      : "Tell us how we can help…"
                  }
                  className="w-full px-3 py-3 text-[13px] leading-relaxed bg-transparent resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-paper/40">
                  <span className="text-[10.5px] text-muted-foreground">{message.length} characters</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {topic || "No topic selected"}
                  </span>
                </div>
              </div>
              {submitted && messageError && (
                <p className="mt-2 text-[11.5px] font-medium text-red-600">{messageError}</p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="mt-3 w-full md:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-ink text-white font-bold text-[11.5px] uppercase tracking-[0.15em] transition-colors hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {busy ? "Submitting…" : "Submit Request"}
              </button>
            </section>
          </form>

          {/* ---- Contact rail ---- */}
          <aside className="lg:sticky lg:top-24 space-y-3">
            <div className="rounded-lg bg-ink text-white p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/70">Agents online</span>
              </div>
              <p className="mt-3 text-[12.5px] text-white/60 leading-relaxed">
                Prefer to talk instead? Reach a client advisor directly.
              </p>
              <div className="mt-4 divide-y divide-white/10">
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={c.action}
                    className="w-full flex items-center gap-3 py-3 text-left group"
                  >
                    <span className="h-9 w-9 rounded-full border border-white/15 grid place-items-center group-hover:border-gold group-hover:text-gold transition-colors">
                      <c.Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold">{c.label}</span>
                      <span className="block text-[11px] text-white/50 truncate">{c.value}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">Service Hours</div>
              <dl className="mt-3 space-y-2.5 text-[12px] md:text-[13px]">
                {[
                  ["Monday - Saturday", "9:00 AM - 8:00 PM WAT"],
                  ["Sunday", "9:00 AM - 8:00 PM WAT"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-bold text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </AccountInnerScaffold>

      {doneId && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/60 px-5">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 text-center">
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
          </div>
        </div>
      )}
      <Toaster position="top-center" />
    </>
  );
}
