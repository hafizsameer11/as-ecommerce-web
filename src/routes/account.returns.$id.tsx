import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { accountApi, koboToNaira, type ApiReturnDetail } from "@/lib/api/account";
import { formatNaira } from "@/components/account/ordersData";

export const Route = createFileRoute("/account/returns/$id")({
  head: () => ({
    meta: [
      { title: "Return Details - ASL ORIGINALS" },
      { name: "description", content: "Track the status of your return and refund." },
    ],
  }),
  component: ReturnDetail,
});

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ReturnDetail() {
  const { id } = Route.useParams();
  const [data, setData] = useState<ApiReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await accountApi.myReturn(id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load this return");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const cancel = async () => {
    if (!data || cancelling) return;
    if (!window.confirm("Cancel this return request?")) return;
    setCancelling(true);
    try {
      await accountApi.cancelReturn(data.id);
      toast.success("Return request cancelled");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this return");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title={data ? `Return ${data.number}` : "Return Details"}
        subtitle={data ? `Order #${data.orderNumber ?? ""}` : undefined}
        activeId="returns"
        backTo="/account/returns"
      >
        {loading ? (
          <p className="text-[13px] text-muted-foreground">Loading return…</p>
        ) : !data ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-center text-[13px] text-muted-foreground">
            We couldn't find that return.{" "}
            <Link to="/account/returns" className="font-semibold text-gold hover:underline">
              Back to returns
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</div>
                  <div className="mt-1 text-[15px] font-semibold">{data.status}</div>
                  {data.statusNote && <div className="text-[12px] text-muted-foreground mt-1">{data.statusNote}</div>}
                </div>
                {data.canCancel && (
                  <button
                    type="button"
                    onClick={() => void cancel()}
                    disabled={cancelling}
                    className="h-10 px-4 rounded-md border border-rose-300 text-rose-600 text-[12px] font-semibold hover:bg-rose-50 disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling…" : "Cancel request"}
                  </button>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <dt className="text-muted-foreground">Requested</dt>
                  <dd className="font-semibold">{fmtDate(data.requestedOn || data.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reason</dt>
                  <dd className="font-semibold">{data.reason}</dd>
                </div>
                {data.details && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Details</dt>
                    <dd>{data.details}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="font-display font-bold text-[13px] uppercase tracking-widest mb-3">Items</h2>
              <div className="divide-y divide-border">
                {(data.items ?? []).map((it, i) => (
                  <div key={`${it.orderItemId}-${i}`} className="flex items-center gap-3 py-3">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="h-14 w-14 rounded-md object-cover bg-muted" />
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      {it.brand && (
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.brand}</div>
                      )}
                      <div className="text-[13px] font-medium truncate">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.variant ? `${it.variant} · ` : ""}Qty {it.qty}
                      </div>
                    </div>
                    <div className="text-[13px] font-semibold">{formatNaira(koboToNaira(it.lineTotal))}</div>
                  </div>
                ))}
              </div>
              {data.photos && data.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {data.photos.map((p) => (
                    <a key={p} href={p} target="_blank" rel="noopener noreferrer">
                      <img src={p} alt="Return evidence" className="h-16 w-16 rounded-md object-cover bg-muted" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {data.refund && (
              <div className="rounded-2xl border border-border bg-white p-5">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-widest mb-3">Refund</h2>
                <dl className="grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <dt className="text-muted-foreground">Refund to</dt>
                    <dd className="font-semibold">{data.refund.toLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-semibold">{formatNaira(koboToNaira(data.refund.amount))}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Processing time</dt>
                    <dd className="font-semibold">{data.refund.processing}</dd>
                  </div>
                  {data.refund.refundedAt && (
                    <div>
                      <dt className="text-muted-foreground">Refunded on</dt>
                      <dd className="font-semibold">{fmtDate(data.refund.refundedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {data.timeline && data.timeline.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-5">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-widest mb-3">Timeline</h2>
                <ol className="space-y-3">
                  {data.timeline.map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-gold shrink-0" />
                      <div>
                        <div className="text-[13px] font-semibold">{t.status}</div>
                        {t.note && <div className="text-[12px] text-muted-foreground">{t.note}</div>}
                        <div className="text-[11px] text-muted-foreground">{fmtDate(t.at)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
