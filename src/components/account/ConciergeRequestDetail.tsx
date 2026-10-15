import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loyaltyApi, koboToNaira } from "@/lib/api/loyalty";
import { useNavigate } from "@tanstack/react-router";

const naira = (kobo: number) => `₦${koboToNaira(kobo).toLocaleString()}`;

export function ConciergeRequestDetail({ id }: { id: string }) {
  const nav = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [request, setRequest] = useState<Awaited<ReturnType<typeof loyaltyApi.getConciergeRequest>> | null>(null);
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);

  const reload = async () => {
    const row = await loyaltyApi.getConciergeRequest(id);
    setRequest(row);
    try {
      const q = await loyaltyApi.getConciergeQuote(id);
      setQuote(q as Record<string, unknown>);
    } catch {
      setQuote(null);
    }
  };

  useEffect(() => {
    void reload().catch((err) => toast.error(err instanceof Error ? err.message : "Could not load request"));
  }, [id]);

  const cancel = async () => {
    if (busy) return;
    setBusy("cancel");
    try {
      await loyaltyApi.cancelConciergeRequest(id, "Cancelled by customer");
      toast.success("Request cancelled");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setBusy(null);
    }
  };

  const decline = async () => {
    if (busy) return;
    setBusy("decline");
    try {
      await loyaltyApi.declineConciergeQuote(id);
      toast.success("Quote declined");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Decline failed");
    } finally {
      setBusy(null);
    }
  };

  const pay = () => {
    nav({ to: "/concierge/payment", search: { requestId: id } });
  };

  if (!request) {
    return <p className="text-[13px] text-muted-foreground py-8">Loading request…</p>;
  }

  const q = (quote ?? request.quote) as { total?: number; deposit?: number; amountDue?: number; status?: string } | null;
  const canPay =
    q &&
    (request.statusKey === "quoted" ||
      request.statusKey === "payment_pending" ||
      request.statusKey === "approved" ||
      request.cartStatus === "Payment Pending");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex gap-4 items-start">
        {request.image ? (
          <img src={request.image} alt="" className="h-20 w-20 rounded-md object-cover bg-muted" />
        ) : null}
        <div>
          <h2 className="font-display text-xl font-bold">{request.itemName}</h2>
          <p className="text-[12px] text-muted-foreground mt-1">Request {request.number ?? request.id}</p>
          <p className="text-[13px] mt-2">{request.statusNote || request.status}</p>
        </div>
      </div>

      {q ? (
        <div className="border border-border rounded-lg p-4 space-y-2 text-[13px]">
          <div className="font-semibold">Quote</div>
          {q.total != null ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>{naira(q.total)}</span>
            </div>
          ) : null}
          {q.deposit != null ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit</span>
              <span>{naira(q.deposit)}</span>
            </div>
          ) : null}
          {q.amountDue != null ? (
            <div className="flex justify-between font-semibold">
              <span>Amount due</span>
              <span>{naira(q.amountDue)}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            {canPay ? (
              <button type="button" onClick={pay} className="bg-ink text-white text-[12px] font-semibold px-4 py-2 rounded-md">
                Pay quote
              </button>
            ) : null}
            {request.statusKey === "quoted" ? (
              <button
                type="button"
                disabled={busy === "decline"}
                onClick={() => void decline()}
                className="border border-border text-[12px] font-semibold px-4 py-2 rounded-md"
              >
                Decline quote
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {request.canCancel !== false && !["completed", "cancelled"].includes((request.statusKey || "").toLowerCase()) ? (
        <button
          type="button"
          disabled={busy === "cancel"}
          onClick={() => void cancel()}
          className="text-[12px] font-semibold text-red-700 underline"
        >
          Cancel request
        </button>
      ) : null}
    </div>
  );
}
