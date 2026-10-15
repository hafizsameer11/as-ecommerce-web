import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, MoreHorizontal, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { otherMethods, mapPaymentMethod, type Card } from "./paymentMethodsData";
import { accountApi } from "@/lib/api/account";
import { fadeInUp } from "@/lib/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MobilePaymentMethods() {
  const nav = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuCard, setMenuCard] = useState<Card | null>(null);
  const [removeCard, setRemoveCard] = useState<Card | null>(null);
  const [renameCard, setRenameCard] = useState<Card | null>(null);
  const [nickname, setNickname] = useState("");

  const refresh = useCallback(async () => {
    try {
      const rows = await accountApi.paymentMethods();
      setCards((rows ?? []).map(mapPaymentMethod));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setDefault = async (id: string) => {
    try {
      const rows = (await accountApi.updatePaymentMethod(id, { isDefault: true })) as Parameters<
        typeof mapPaymentMethod
      >[0][];
      setCards((Array.isArray(rows) ? rows : []).map(mapPaymentMethod));
      toast.success("Default card updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update card");
    }
    setMenuCard(null);
  };

  const confirmRemove = async () => {
    if (!removeCard) return;
    try {
      await accountApi.removePaymentMethod(removeCard.id);
      setCards((list) => list.filter((c) => c.id !== removeCard.id));
      toast.success("Card removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove card");
    }
    setRemoveCard(null);
  };

  const confirmRename = async () => {
    if (!renameCard) return;
    try {
      const rows = (await accountApi.updatePaymentMethod(renameCard.id, {
        nickname: nickname.trim() || null,
      })) as Parameters<typeof mapPaymentMethod>[0][];
      setCards((Array.isArray(rows) ? rows : []).map(mapPaymentMethod));
      toast.success("Card renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename card");
    }
    setRenameCard(null);
  };

  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display font-bold text-[15px]">Payment Methods</h1>
          <button onClick={() => nav({ to: "/account/payment-methods/new" })} aria-label="Add">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-3 py-4 space-y-5">
        <div className="space-y-3">
          {loading ? (
            <p className="text-[13px] text-muted-foreground px-1">Loading cards…</p>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="font-semibold text-[14px]">No saved cards</div>
              <p className="text-[12px] text-muted-foreground mt-1">
                Add a card with a ₦50 verification charge (refunded automatically).
              </p>
            </div>
          ) : (
            cards.map((c) => (
              <motion.div
                key={c.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="relative rounded-2xl bg-gradient-to-br from-ink via-ink to-neutral-800 text-white p-5 overflow-hidden"
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/10" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/60">{c.brand}</div>
                    {c.isDefault && (
                      <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <button onClick={() => setMenuCard(c)}>
                    <MoreHorizontal className="h-5 w-5 text-white/80" />
                  </button>
                </div>
                <div className="relative mt-6">
                  <div className="font-sans text-lg tracking-widest">•••• •••• •••• {c.last4}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-white/50">Card Holder</div>
                      <div className="text-[12px] font-semibold">{c.holder}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-white/50">Expires</div>
                      <div className="text-[12px] font-semibold">
                        {c.expMonth}/{c.expYear}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div>
          <h2 className="font-display font-bold text-[13px] mb-3 px-1">Other Payment Options</h2>
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            {otherMethods.map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  m.id === "new-card"
                    ? nav({ to: "/account/payment-methods/new" })
                    : toast(m.label, { description: m.desc })
                }
                className="w-full flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/20 text-left"
              >
                <m.Icon className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px]">{m.label}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-[#f5efe6] p-3.5">
          <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.5} />
          <div className="text-[11px] text-foreground/80 leading-snug">
            Your payment info is encrypted and securely stored.
          </div>
        </div>
      </div>

      <Dialog open={!!menuCard} onOpenChange={(o) => !o && setMenuCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {menuCard?.brand} •••• {menuCard?.last4}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {!menuCard?.isDefault && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => menuCard && void setDefault(menuCard.id)}
              >
                Set as default
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (!menuCard) return;
                setNickname(menuCard.nickname || "");
                setRenameCard(menuCard);
                setMenuCard(null);
              }}
            >
              Rename card
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                setRemoveCard(menuCard);
                setMenuCard(null);
              }}
            >
              Remove card
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameCard} onOpenChange={(o) => !o && setRenameCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename card</DialogTitle>
          </DialogHeader>
          <input
            className="w-full h-10 rounded-md border border-border px-3 text-sm"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameCard(null)}>
              Cancel
            </Button>
            <Button onClick={() => void confirmRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeCard} onOpenChange={(o) => !o && setRemoveCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove {removeCard?.brand} •••• {removeCard?.last4}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveCard(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmRemove()}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}
