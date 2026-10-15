import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Plus, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { useTickets, type TicketStatus } from "@/lib/tickets-store";

export const Route = createFileRoute("/account/tickets/")({
  head: () => ({
    meta: [
      { title: "My Support Tickets - ASL ORIGINALS" },
      { name: "description", content: "Track and manage your support conversations with ASL ORIGINALS." },
      { property: "og:title", content: "My Support Tickets - ASL ORIGINALS" },
      { property: "og:description", content: "Track and manage your support conversations with ASL ORIGINALS." },
    ],
  }),
  component: MyTickets,
});

const statusStyles: Record<TicketStatus, { label: string; className: string; Icon: typeof Clock }> = {
  open: { label: "Open", className: "bg-ink text-white border-ink", Icon: AlertCircle },
  pending: { label: "Awaiting You", className: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
  on_hold: { label: "On Hold", className: "bg-muted text-muted-foreground border-border", Icon: Clock },
  resolved: { label: "Resolved", className: "bg-blue-50 text-blue-700 border-blue-200", Icon: CheckCircle2 },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border", Icon: CheckCircle2 },
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function MyTickets() {
  const tickets = useTickets((s) => s.tickets);
  const hydrate = useTickets((s) => s.hydrate);
  const hydrated = useTickets((s) => s.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <AccountInnerScaffold
      title="Support Tickets"
      subtitle="Your conversations with our care team"
      activeId="help"
      backTo="/account/help"
      right={
        <Link
          to="/account/help/contact"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-ink text-white text-[12px] font-semibold hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      }
    >
      {!hydrated ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
          Loading tickets…
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="font-semibold text-[14px]">No tickets yet</div>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-xs mx-auto">
            When you contact our support team, your conversations will appear here so you can track replies.
          </p>
          <Link
            to="/account/help/contact"
            className="inline-flex items-center gap-1.5 mt-4 h-10 px-4 rounded-md bg-ink text-white text-[12.5px] font-semibold hover:bg-ink/90"
          >
            <Plus className="h-4 w-4" /> Start a conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const s = statusStyles[t.status];
            const lastMsg = t.messages[t.messages.length - 1];
            const unread = lastMsg?.author === "agent";
            return (
              <Link
                key={t.id}
                to="/account/tickets/$id"
                params={{ id: t.id }}
                className="block rounded-xl border border-border bg-white p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-muted-foreground font-sans">{t.number}</span>
                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${s.className}`}>
                        <s.Icon className="h-3 w-3" /> {s.label}
                      </span>
                      {unread && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                    </div>
                    <div className="font-semibold text-[13.5px] truncate">{t.subject}</div>
                    {lastMsg && (
                      <div className="text-[12px] text-muted-foreground mt-1 line-clamp-1">
                        <span className="font-medium text-foreground/70">
                          {lastMsg.author === "customer" ? "You" : lastMsg.authorName}:
                        </span>{" "}
                        {lastMsg.body}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-1.5">Updated {timeAgo(t.updatedAt)}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AccountInnerScaffold>
  );
}
