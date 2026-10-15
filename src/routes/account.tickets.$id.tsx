import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Send, CheckCircle2, Clock, AlertCircle, User, Headphones, Info } from "lucide-react";
import { toast } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { useTickets, type TicketStatus } from "@/lib/tickets-store";

export const Route = createFileRoute("/account/tickets/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Ticket ${params.id} - ASL ORIGINALS` },
      { name: "description", content: "Your ASL ORIGINALS support ticket." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TicketDetail,
});

const statusStyles: Record<TicketStatus, { label: string; className: string; Icon: typeof Clock }> = {
  open: { label: "Open", className: "bg-ink text-white border-ink", Icon: AlertCircle },
  pending: { label: "Awaiting You", className: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
  on_hold: { label: "On Hold", className: "bg-muted text-muted-foreground border-border", Icon: Clock },
  resolved: { label: "Resolved", className: "bg-blue-50 text-blue-700 border-blue-200", Icon: CheckCircle2 },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border", Icon: CheckCircle2 },
};

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TicketDetail() {
  const { id } = Route.useParams();
  const ticket = useTickets((s) => s.tickets.find((t) => t.id === id));
  const getTicket = useTickets((s) => s.getTicket);
  const customerReply = useTickets((s) => s.customerReply);
  const reopen = useTickets((s) => s.reopen);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(!ticket);
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const nav = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const row = await getTicket(id);
      if (cancelled) return;
      setMissing(!row);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, getTicket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  if (loading && !ticket) {
    return (
      <AccountInnerScaffold title="Support Ticket" activeId="help" backTo="/account/tickets">
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
          Loading ticket…
        </div>
      </AccountInnerScaffold>
    );
  }

  if (missing || !ticket) {
    return (
      <AccountInnerScaffold title="Ticket not found" activeId="help" backTo="/account/tickets">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="font-semibold">We couldn't find that ticket.</div>
          <Link to="/account/tickets" className="inline-block mt-3 text-[13px] text-ink underline">
            Back to my tickets
          </Link>
        </div>
      </AccountInnerScaffold>
    );
  }

  const visibleMessages = ticket.messages.filter((m) => !m.internal);
  const s = statusStyles[ticket.status];

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await customerReply(ticket.id, body);
      setDraft("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reply");
    } finally {
      setSending(false);
    }
  };

  const canReopen = ticket.canReopen ?? (ticket.status === "resolved" || ticket.status === "closed");

  return (
    <AccountInnerScaffold
      title={ticket.subject}
      subtitle={`Ticket ${ticket.number} · Opened ${fmtTime(ticket.createdAt)}`}
      activeId="help"
      backTo="/account/tickets"
      right={
        <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-full border ${s.className}`}>
          <s.Icon className="h-3 w-3" /> {s.label}
        </span>
      }
    >
      {ticket.orderRef && (
        <div className="rounded-xl border border-border bg-white p-3 flex items-center gap-2 text-[12.5px]">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Referenced order:</span>
          <span className="font-sans font-semibold">{ticket.orderRef}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white overflow-hidden flex flex-col min-h-[calc(100vh-260px)] md:min-h-[calc(100vh-300px)]">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {visibleMessages.map((m) => {
            const mine = m.author === "customer";
            const sys = m.author === "system";
            if (sys) {
              return (
                <div key={m.id} className="text-center text-[11px] text-muted-foreground italic">
                  {m.body} · {fmtTime(m.at)}
                </div>
              );
            }
            return (
              <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${
                    mine ? "bg-ink text-white" : "bg-gold/20 text-ink"
                  }`}
                >
                  {mine ? <User className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                </div>
                <div className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  <div className="text-[10.5px] text-muted-foreground mb-1 px-1">
                    <span className="font-semibold text-foreground/80">
                      {mine ? "You" : m.authorName}
                    </span>{" "}
                    · {fmtTime(m.at)}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] whitespace-pre-wrap ${
                      mine
                        ? "bg-ink text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {ticket.status === "closed" && !canReopen ? (
          <div className="border-t border-border p-4 bg-muted/30 text-center text-[12.5px] text-muted-foreground">
            This ticket is closed.{" "}
            <button
              className="underline font-semibold text-ink"
              onClick={() => nav({ to: "/account/help/contact" })}
            >
              Start a new one
            </button>
          </div>
        ) : ticket.status === "closed" ? (
          <div className="border-t border-border p-4 bg-muted/30 text-center text-[12.5px] text-muted-foreground">
            This ticket is closed.{" "}
            <button
              className="underline font-semibold text-ink"
              onClick={() => void reopen(ticket.id).catch((err) => toast.error(err instanceof Error ? err.message : "Could not reopen"))}
            >
              Reopen
            </button>
            {" · "}
            <button
              className="underline font-semibold text-ink"
              onClick={() => nav({ to: "/account/help/contact" })}
            >
              Start a new one
            </button>
          </div>
        ) : (
          <div className="border-t border-border p-3 bg-white">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void send();
              }}
              placeholder="Type your reply…"
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
            />
            <div className="flex items-center justify-end mt-2 gap-2">
              <div className="flex items-center gap-2">
                {canReopen && (
                  <button
                    onClick={() => void reopen(ticket.id).catch((err) => toast.error(err instanceof Error ? err.message : "Could not reopen"))}
                    className="h-9 px-3 rounded-md border border-border text-[12px] font-semibold hover:bg-muted"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => void send()}
                  disabled={!draft.trim() || sending}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ink text-white text-[12.5px] font-semibold hover:bg-ink/90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountInnerScaffold>
  );
}
