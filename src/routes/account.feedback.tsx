import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { MessageSquare, Send, Lightbulb, Bug, Heart, Check } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";

export const Route = createFileRoute("/account/feedback")({
  head: () => ({
    meta: [
      { title: "Send Feedback - ASL ORIGINALS" },
      { name: "description", content: "Share ideas, report an issue or tell us what you love about the ASL ORIGINALS app." },
      { property: "og:title", content: "Send Feedback - ASL ORIGINALS" },
      { property: "og:description", content: "Share ideas, report an issue or tell us what you love about ASL ORIGINALS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feedback,
});

const TYPES = [
  { id: "idea", label: "Suggestion", Icon: Lightbulb },
  { id: "bug", label: "Something broken", Icon: Bug },
  { id: "praise", label: "Compliment", Icon: Heart },
];

const AREAS = ["Shopping", "Checkout", "Concierge", "Delivery", "Account", "ASL Club", "Other"];

function Feedback() {
  const [type, setType] = useState("idea");
  const [area, setArea] = useState("Shopping");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) return toast.error("Please add a little more detail");
    setSent(true);
    setMessage("");
    toast.success("Feedback sent - thank you");
  };

  if (sent) {
    return (
      <>
        <AccountInnerScaffold title="Send Feedback" subtitle="Help us make ASL ORIGINALS better." activeId="feedback" backTo="/account">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gold/10 grid place-items-center">
              <Check className="h-6 w-6 text-gold" />
            </div>
            <h2 className="mt-3 font-display font-bold text-[17px]">Feedback received</h2>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Our team reads every message. If you asked for a reply, we'll be in touch shortly.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-5 h-12 w-full rounded-md bg-ink text-white font-semibold text-[13px] tracking-[0.08em] uppercase hover:bg-ink/90"
            >
              Send Another
            </button>
          </motion.div>
        </AccountInnerScaffold>
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <AccountInnerScaffold title="Send Feedback" subtitle="Help us make ASL ORIGINALS better." activeId="feedback" backTo="/account">
        <motion.form onSubmit={submit} variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold/10 grid place-items-center">
              <MessageSquare className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[15px]">Tell us what you think</h2>
              <p className="text-[12px] text-muted-foreground">Every note goes straight to our product team.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  type === t.id ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:border-ink/40"
                }`}
              >
                <t.Icon className="h-5 w-5 mx-auto" strokeWidth={1.6} />
                <span className="mt-1.5 block text-[11.5px] font-semibold leading-tight">{t.label}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">Area</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`h-9 px-4 rounded-full border text-[12.5px] transition-colors ${
                    area === a ? "bg-ink text-white border-ink" : "bg-white text-ink border-border hover:border-ink/40"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Share as much detail as you can..."
            className="w-full rounded-md border border-border bg-white p-3 text-[16px] md:text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/30"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email for a reply (optional)"
            className="w-full h-12 px-3 rounded-md border border-border bg-white text-[16px] md:text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/30"
          />

          <button
            type="submit"
            className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[13px] tracking-[0.08em] uppercase hover:bg-ink/90 inline-flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" /> Send Feedback
          </button>
        </motion.form>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
