import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { otherMethods, mapPaymentMethod, type Card } from "./paymentMethodsData";
import { accountApi } from "@/lib/api/account";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DesktopPaymentMethods() {
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
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="payment-methods" />

        <div className="space-y-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex items-center justify-between"
          >
            <div>
              <motion.h1 variants={staggerItem} className="font-display text-3xl font-bold">
                Payment Methods
              </motion.h1>
              <motion.p variants={staggerItem} className="text-sm text-muted-foreground mt-1">
                Manage your saved cards and payment options.
              </motion.p>
            </div>
            <motion.button
              variants={staggerItem}
              onClick={() => nav({ to: "/account/payment-methods/new" })}
              className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-ink/90"
            >
              <Plus className="h-4 w-4" /> Add New Card
            </motion.button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-5"
          >
            {loading ? (
              <p className="text-sm text-muted-foreground col-span-2">Loading cards…</p>
            ) : cards.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-border bg-white p-6">
                <div className="font-semibold">No saved cards</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a card with a ₦50 verification charge (refunded automatically).
                </p>
              </div>
            ) : (
              cards.map((c) => (
                <div
                  key={c.id}
                  className="relative rounded-2xl bg-gradient-to-br from-ink via-ink to-neutral-800 text-white p-6 min-h-[200px] flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10" />
                  <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-gold/5" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-white/60">{c.brand}</div>
                      {c.isDefault && (
                        <span className="mt-2 inline-block text-[9px] font-bold uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <button onClick={() => setMenuCard(c)} className="text-white/70 hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="font-sans text-xl tracking-widest">•••• •••• •••• {c.last4}</div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-white/50">Card Holder</div>
                        <div className="text-[13px] font-semibold">{c.holder}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-white/50">Expires</div>
                        <div className="text-[13px] font-semibold">
                          {c.expMonth}/{c.expYear}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <h2 className="font-display font-bold text-[15px] mb-4">Other Payment Options</h2>
            <div className="grid grid-cols-2 gap-4">
              {otherMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    m.id === "new-card"
                      ? nav({ to: "/account/payment-methods/new" })
                      : toast(m.label, { description: m.desc })
                  }
                  className="rounded-2xl bg-[#f5f5f5] border border-[#e5e5e5] p-5 flex items-center gap-4 text-left hover:bg-[#eeeeee] transition-colors"
                >
                  <div className="h-11 w-11 rounded-full bg-white grid place-items-center shrink-0">
                    <m.Icon className="h-5 w-5 text-ink" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">{m.label}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 rounded-xl bg-[#f5efe6] p-4"
          >
            <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.5} />
            <div className="text-[12px] text-foreground/80">
              Your payment information is encrypted and securely stored. We never share your card details.
            </div>
          </motion.div>
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
    </DesktopShell>
  );
}
