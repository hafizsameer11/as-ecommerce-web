import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { accountApi, type ApiOrderCard, type ApiReturnable } from "@/lib/api/account";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/account/returns/start")({
  head: () => ({
    meta: [
      { title: "Start a Return - ASL ORIGINALS" },
      { name: "description", content: "Start a return request for your ASL ORIGINALS order." },
    ],
  }),
  component: StartReturnPage,
});

function StartReturnPage() {
  const nav = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<ApiOrderCard[]>([]);
  const [orderId, setOrderId] = useState("");
  const [returnable, setReturnable] = useState<ApiReturnable | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [refundTo, setRefundTo] = useState<"original" | "wallet">("original");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void accountApi
      .myOrders({ pageSize: 50 })
      .then((rows) =>
        setOrders(
          (rows ?? []).filter(
            (o) =>
              o.statusKey === "delivered" ||
              o.statusKey === "partially_refunded" ||
              o.status === "Delivered",
          ),
        ),
      )
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load orders"));
  }, []);

  const loadReturnable = useCallback(async (id: string) => {
    setOrderId(id);
    setSelected({});
    setReturnable(null);
    if (!id) return;
    try {
      const r = await accountApi.returnable(id);
      setReturnable(r);
      setReason(r.reasons?.[0] ?? "");
      const init: Record<string, number> = {};
      for (const it of r.items) {
        if (it.returnable > 0) init[it.orderItemId] = it.returnable;
      }
      setSelected(init);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order not returnable");
    }
  }, []);

  const submit = async () => {
    if (!returnable) return toast.error("Select an order");
    const items = Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, qty]) => ({ orderItemId, qty }));
    if (!items.length) return toast.error("Choose at least one item");
    if (!reason) return toast.error("Select a reason");
    const needsPhotos = (returnable.photosRequiredFor ?? []).includes(reason);
    if (needsPhotos && !photos.length) return toast.error("Please add at least one photo of the damage");
    if (busy) return;
    setBusy(true);
    try {
      await accountApi.createReturn(
        { orderId: returnable.orderId, items, reason, details: details.trim() || undefined, refundTo },
        photos,
      );
      toast.success("Return request submitted");
      void nav({ to: "/account/returns" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create return");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold title="Start a Return" activeId="returns" backTo="/account/returns">
        <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Order</label>
            {orders.length ? (
              <Select value={orderId} onValueChange={(v) => void loadReturnable(v)}>
                <SelectTrigger className="mt-1.5 h-11 w-full">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.number} · {o.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-2 text-[12px] text-muted-foreground">No returnable orders found.</p>
            )}
            {returnable && !returnable.eligible ? (
              <p className="mt-2 text-[12px] text-rose-600">
                {returnable.reasonText || "This order is not eligible for return."}
              </p>
            ) : null}
          </div>

          {returnable?.eligible ? (
            <>
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Items</p>
                {returnable.items
                  .filter((it) => it.returnable > 0)
                  .map((it) => {
                    const on = (selected[it.orderItemId] ?? 0) > 0;
                    return (
                      <button
                        key={it.orderItemId}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [it.orderItemId]: on ? 0 : it.returnable,
                          }))
                        }
                        className="w-full flex items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-muted/30"
                      >
                        <Checkbox checked={on} className="pointer-events-none" />
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md bg-muted object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-muted" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate">{it.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {it.variant || it.size || ""} · up to {it.returnable}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Reason</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1.5 h-11 w-full">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {returnable.reasons.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details (optional)"
                className="w-full min-h-[100px] px-3 py-2.5 rounded-md border border-border bg-white text-[13px] resize-y"
              />

              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Refund to</p>
                <div className="mt-2 flex gap-2">
                  {(["original", "wallet"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRefundTo(v)}
                      className={`flex-1 h-10 rounded-md border text-[12px] font-semibold ${
                        refundTo === v ? "bg-ink border-ink text-white" : "border-border"
                      }`}
                    >
                      {v === "original" ? "Original payment" : "ASL Wallet"}
                    </button>
                  ))}
                </div>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos((p) => [...p, ...files].slice(0, returnable.maxPhotos ?? 5));
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full h-11 rounded-md border border-dashed border-border text-[12px] font-semibold hover:bg-muted/30"
              >
                {photos.length ? `${photos.length} photo(s) attached` : "Add photos"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[14px] hover:bg-ink/90 disabled:opacity-60"
              >
                {busy ? "Submitting…" : "Submit return"}
              </button>
            </>
          ) : null}
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
