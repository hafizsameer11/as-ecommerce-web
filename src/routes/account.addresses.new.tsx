import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { Home, Briefcase, MapPin } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { accountApi } from "@/lib/api/account";

type Label = "Home" | "Work" | "Other";

type AddressNewSearch = { id?: string };

export const Route = createFileRoute("/account/addresses/new")({
  validateSearch: (search: Record<string, unknown>): AddressNewSearch => {
    if (typeof search.id === "string" && search.id) return { id: search.id };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Add Address - ASL ORIGINALS" },
      { name: "description", content: "Save a new shipping or billing address." },
    ],
  }),
  component: AddAddress,
});

const FIELDS = [
  { l: "Full Name", p: "", key: "recipient" },
  { l: "Phone", p: "+234 801 234 5678", key: "phone" },
  { l: "Address Line 1", p: "12 Bourdillon Road", key: "line1" },
  { l: "Address Line 2", p: "Ikoyi / apt", key: "line2" },
  { l: "City", p: "Lagos", key: "city" },
  { l: "State", p: "Lagos State", key: "state" },
  { l: "Country", p: "Nigeria", key: "country" },
] as const;

function AddAddress() {
  const nav = useNavigate();
  const { id } = Route.useSearch();
  const editing = !!id;
  const [label, setLabel] = useState<Label>("Home");
  const [values, setValues] = useState<Record<string, string>>({});
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const a = await accountApi.address(id);
        if (cancelled) return;
        const nextLabel: Label = /work|office/i.test(a.label)
          ? "Work"
          : /other/i.test(a.label)
            ? "Other"
            : "Home";
        setLabel(nextLabel);
        setIsDefault(!!a.isDefault);
        setValues({
          recipient: a.recipient ?? "",
          phone: a.phone ?? "",
          line1: a.line1 ?? "",
          line2: a.line2 ?? "",
          city: a.city ?? "",
          state: a.state ?? "",
          country: a.country ?? "Nigeria",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load address");
        nav({ to: "/account/addresses" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["recipient", "phone", "line1", "city", "state", "country"] as const;
    const missing = required.find((k) => !values[k]?.trim());
    if (missing) {
      toast.error("Please fill out all required fields");
      return;
    }
    if (saving) return;
    setSaving(true);
    const body = {
      label,
      type: "shipping" as const,
      recipient: values.recipient.trim(),
      phone: values.phone.trim(),
      line1: values.line1.trim(),
      line2: values.line2?.trim() || null,
      city: values.city.trim(),
      state: values.state.trim(),
      country: values.country.trim() || "NG",
      isDefault,
    };
    try {
      if (editing && id) {
        await accountApi.updateAddress(id, body);
        toast.success("Address updated");
      } else {
        await accountApi.createAddress(body);
        toast.success("Address saved");
      }
      nav({ to: "/account/addresses" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title={editing ? "Edit Address" : "Add New Address"}
        subtitle={
          editing
            ? "Update your shipping or billing address."
            : "Save a new shipping or billing address."
        }
        activeId="address"
        backTo="/account/addresses"
      >
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-5 text-[13px] text-muted-foreground text-center">
            Loading address…
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Label</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([{ v: "Home" as const, I: Home }, { v: "Work" as const, I: Briefcase }, { v: "Other" as const, I: MapPin }]).map(
                  ({ v, I }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setLabel(v)}
                      className={`inline-flex items-center justify-center gap-2 py-2.5 rounded-md border text-[13px] font-semibold ${
                        label === v ? "bg-ink text-white border-ink" : "bg-white border-border"
                      }`}
                    >
                      <I className="h-4 w-4" /> {v}
                    </button>
                  ),
                )}
              </div>
            </div>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{f.l}</label>
                <input
                  required={f.key !== "line2"}
                  placeholder={f.p}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            ))}
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />{" "}
              Set as default address
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => nav({ to: "/account/addresses" })}
                className="flex-1 h-11 rounded-md border border-border font-semibold text-[13px] hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[13px] hover:bg-ink/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        )}
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
