import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Edit3, Trash2, Check, type LucideIcon } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { fadeInUp } from "@/lib/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { accountApi, type ApiAddress } from "@/lib/api/account";

export const Route = createFileRoute("/account/addresses/")({
  head: () => ({
    meta: [
      { title: "Address Book - ASL ORIGINALS" },
      { name: "description", content: "Manage your saved shipping and billing addresses." },
      { property: "og:title", content: "Address Book - ASL ORIGINALS" },
      { property: "og:description", content: "Manage your saved addresses." },
    ],
  }),
  component: AddressesPage,
});

type Address = {
  id: string;
  label: string;
  Icon: LucideIcon;
  name: string;
  line1: string;
  line2: string;
  state: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

function mapAddress(a: ApiAddress): Address {
  const label = a.label || "Address";
  const Icon = /work|office/i.test(label) ? Briefcase : Home;
  return {
    id: a.id,
    label,
    Icon,
    name: a.recipient,
    line1: a.line1,
    line2: [a.line2, a.city].filter(Boolean).join(", "),
    state: a.state,
    country: a.country,
    phone: a.phone,
    isDefault: a.isDefault,
  };
}

function AddressesPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <Desktop /> : <Mobile />}
      <Toaster position="top-center" />
    </>
  );
}

function useAddressBook() {
  const nav = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const reload = async () => {
    try {
      const rows = await accountApi.addresses();
      setAddresses(rows.map(mapAddress));
    } catch (err) {
      console.warn("[addresses]", err);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const setDefault = async (id: string) => {
    try {
      const rows = await accountApi.setDefaultAddress(id);
      setAddresses(rows.map(mapAddress));
      toast.success("Default address updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update default");
    }
  };
  const edit = (a: Address) => {
    nav({ to: "/account/addresses/new", search: { id: a.id } });
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await accountApi.deleteAddress(deleteTarget.id);
      setAddresses((list) => list.filter((a) => a.id !== deleteTarget.id));
      toast.success(`${deleteTarget.label} address removed`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete address");
    }
  };

  return { addresses, setDefault, edit, deleteTarget, setDeleteTarget, confirmDelete };
}

function Card({
  a,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  a: Address;
  onEdit: (a: Address) => void;
  onDelete: (a: Address) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
            <a.Icon className="h-4.5 w-4.5 text-ink" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold text-[14px] flex items-center gap-2">
              {a.label}
              {a.isDefault && <span className="text-[9px] font-bold uppercase tracking-widest bg-ink text-white px-1.5 py-0.5 rounded">Default</span>}
            </div>
            <div className="text-[11px] text-muted-foreground">{a.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(a)} className="h-8 w-8 rounded-full hover:bg-muted grid place-items-center"><Edit3 className="h-4 w-4" /></button>
          <button onClick={() => onDelete(a)} className="h-8 w-8 rounded-full hover:bg-rose-50 grid place-items-center"><Trash2 className="h-4 w-4 text-rose-600" /></button>
        </div>
      </div>
      <div className="mt-4 text-[13px] text-foreground/80 leading-relaxed">
        {a.line1}<br />{a.line2}<br />{a.state}, {a.country}<br />
        <span className="text-muted-foreground text-[12px]">{a.phone}</span>
      </div>
      {!a.isDefault && (
        <button onClick={() => onSetDefault(a.id)} className="mt-4 text-[12px] font-semibold text-ink hover:text-gold inline-flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" /> Set as default
        </button>
      )}
    </motion.div>
  );
}

function DeleteDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: Address | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {target?.label} address?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Desktop() {
  const nav = useNavigate();
  const { addresses, setDefault, edit, deleteTarget, setDeleteTarget, confirmDelete } = useAddressBook();
  return (

    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="address" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">Address Book</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your saved shipping and billing addresses.</p>
            </div>
            <button onClick={() => nav({ to: "/account/addresses/new", search: {} })} className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-ink/90">
              <Plus className="h-4 w-4" /> Add New Address
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {addresses.map((a) => <Card key={a.id} a={a} onEdit={edit} onDelete={setDeleteTarget} onSetDefault={setDefault} />)}
            <button onClick={() => nav({ to: "/account/addresses/new", search: {} })} className="rounded-2xl border-2 border-dashed border-border p-5 min-h-[220px] grid place-items-center text-muted-foreground hover:bg-muted/20 hover:text-ink">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto" strokeWidth={1.5} />
                <div className="mt-2 text-[13px] font-semibold">Add New Address</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </DesktopShell>
  );
}

function Mobile() {
  const nav = useNavigate();
  const { addresses, setDefault, edit, deleteTarget, setDeleteTarget, confirmDelete } = useAddressBook();
  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-[15px]">Address Book</h1>
          <button onClick={() => nav({ to: "/account/addresses/new", search: {} })} aria-label="Add"><Plus className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="px-3 py-4 space-y-3">
        {addresses.map((a) => <Card key={a.id} a={a} onEdit={edit} onDelete={setDeleteTarget} onSetDefault={setDefault} />)}
        <button onClick={() => nav({ to: "/account/addresses/new", search: {} })} className="w-full rounded-2xl border-2 border-dashed border-border p-4 text-muted-foreground hover:bg-muted/20 inline-flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> <span className="text-[13px] font-semibold">Add New Address</span>
        </button>
      </div>
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </MobileShell>
  );
}
