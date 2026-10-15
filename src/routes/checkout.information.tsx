import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { Truck, Building2, MapPin, ArrowRight, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { naira } from "@/components/checkout/checkoutData";
import { useCheckout, shippingFor } from "@/lib/checkout-store";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { usePublicSettings } from "@/lib/api/settings";
import { deliveryEtaSummary, deliveryRatesNaira } from "@/lib/public-settings-format";

export const Route = createFileRoute("/checkout/information")({
  head: () => ({ meta: [{ title: "Checkout: Information - ASL ORIGINALS" }] }),
  component: InformationPage,
});

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States",
  "Canada", "United Arab Emirates", "France", "Italy", "Germany", "Netherlands",
  "Spain", "China", "Australia", "Other",
];

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {msg}
    </p>
  );
}

function Field({ label, value, onChange, error, ...props }: { label: string; value: string; onChange: (v: string) => void; error?: string; [k: string]: unknown }) {
  return (
    <div>
      <input
        value={value}
        placeholder={label}
        aria-label={label}
        aria-invalid={!!error}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        {...props}
        className={`w-full h-11 rounded-md border bg-background px-3 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
          error ? "border-red-500 ring-red-500 focus:ring-red-500" : "border-border focus:ring-ink"
        }`}
      />
      <ErrorText msg={error} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }: { label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string }) {
  return (
    <div>
      <select
        aria-label={label}
        aria-invalid={!!error}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 rounded-md border bg-background px-3 text-[14px] focus:outline-none focus:ring-1 ${
          error ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ink"
        }`}
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ErrorText msg={error} />
    </div>
  );
}

function InformationPage() {
  const ok = useAuthGuard();
  const { data: publicSettings } = usePublicSettings();
  const deliveryRows = deliveryRatesNaira(publicSettings);
  const deliveryEta = deliveryEtaSummary(publicSettings);
  const navigate = useNavigate();
  const contact = useCheckout((s) => s.contact);
  const address = useCheckout((s) => s.address);
  const method = useCheckout((s) => s.delivery);
  const setContact = useCheckout((s) => s.setContact);
  const setAddress = useCheckout((s) => s.setAddress);
  const setMethod = useCheckout((s) => s.setDelivery);
  const syncSession = useCheckout((s) => s.syncSession);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void syncSession();
  }, [syncSession]);

  const errors: Record<string, string> = {};
  if (!contact.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) errors.email = "Enter a valid email address.";
  if (!contact.phone.trim()) errors.phone = "Please enter your phone number.";
  else if (contact.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number.";
  if (method === "ship") {
    if (!address.fullName.trim()) errors.fullName = "Please enter your full name.";
    if (!address.address.trim()) errors.address = "Please enter your street address.";
    if (!address.city.trim()) errors.city = "Please enter your city.";
    if (!address.state.trim()) errors.state = "Please enter your state.";
    if (!address.country.trim()) errors.country = "Please select your country.";
  }
  const show = (k: string) => (submitted ? errors[k] : undefined);

  const handleContinue = () => {
    if (Object.keys(errors).length > 0) {
      setSubmitted(true);
      toast.error("Please fill in the highlighted fields.");
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    void syncSession().finally(() => navigate({ to: "/checkout/payment" }));
  };

  if (!ok) return null;

  return (
    <>
      <CheckoutPage title="Information" step={2}>
        <div className="space-y-5">
          <div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-display text-xl md:text-2xl font-bold">Information</h1>
                <p className="text-[13px] text-muted-foreground mt-1">Enter your details to continue.</p>
              </div>
              <div className="text-[12px] text-muted-foreground">
                Already have an account? <Link to="/account" className="underline font-semibold">Log in</Link>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-[15px] font-semibold mb-3">1. Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Email Address" type="email" value={contact.email} onChange={(v) => setContact({ email: v })} error={show("email")} />
              <Field label="Phone Number" value={contact.phone} onChange={(v) => setContact({ phone: v })} error={show("phone")} />
            </div>
            <label className="flex items-center gap-2 mt-3 text-[13px]">
              <input type="checkbox" checked={contact.subscribe} onChange={(e) => setContact({ subscribe: e.target.checked })} className="accent-ink" />
              Email me with news and offers
            </label>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-3">2. Delivery Method</h2>
            <div className="space-y-2">
              <button
                onClick={() => setMethod("ship")}
                className={`w-full flex items-center gap-3 px-3 py-3 border rounded-md text-left ${method === "ship" ? "border-ink ring-1 ring-ink" : "border-border hover:bg-muted/40"}`}
              >
                <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${method === "ship" ? "border-ink" : "border-muted-foreground"}`}>
                  {method === "ship" && <span className="h-2 w-2 rounded-full bg-ink" />}
                </span>
                <Truck className="h-5 w-5" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">Ship to Address</div>
                  <div className="text-[12px] text-muted-foreground">Have your order delivered to your doorstep.</div>
                </div>
                <div className="text-[13px] font-semibold">{naira(shippingFor("ship", address.state))}</div>
              </button>

              <button
                onClick={() => setMethod("pickup")}
                className={`w-full flex items-center gap-3 px-3 py-3 border rounded-md text-left ${method === "pickup" ? "border-ink ring-1 ring-ink" : "border-border hover:bg-muted/40"}`}
              >
                <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${method === "pickup" ? "border-ink" : "border-muted-foreground"}`}>
                  {method === "pickup" && <span className="h-2 w-2 rounded-full bg-ink" />}
                </span>
                <Building2 className="h-5 w-5" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">Pick Up In Store</div>
                  <div className="text-[12px] text-muted-foreground">Pick up your order at our store.</div>
                </div>
                <div className="text-[13px] font-semibold">Free</div>
              </button>

              {method === "ship" ? (
                <div className="rounded-md bg-muted/60 border border-border p-3 mt-2">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    <MapPin className="h-4 w-4" /> Delivery Fee (Fixed Rate)
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">Flat delivery rates to ensure fast and reliable service.</p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {deliveryRows.map((c) => (
                       <div key={c.label} className="bg-background border border-border rounded-md p-2.5">
                        <div className="text-[11px] text-muted-foreground">{c.label}</div>
                        <div className="text-[14px] font-bold">{naira(c.feeNaira)}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">Delivery time: {deliveryEta}</p>
                </div>
              ) : (
                <div className="rounded-md bg-muted/60 border border-border p-3 mt-2">
                  <div className="flex items-start gap-2 text-[13px]">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-semibold">ASL ORIGINALS Lekki</div>
                      <div className="text-[12px] text-muted-foreground">The Lennox Mall, Admiralty Way, Lekki Phase 1, Lagos, Nigeria.</div>
                      <div className="text-[12px] text-muted-foreground mt-1">Mon - Sat: 10:00 AM - 9:00 PM · Sun: 12:00 PM - 7:00 PM</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {method === "ship" && (
            <section>
              <h2 className="text-[15px] font-semibold mb-3">3. Delivery Address</h2>
              <div className="grid md:grid-cols-2 gap-2.5">
                <Field label="Full Name" value={address.fullName} onChange={(v) => setAddress({ fullName: v })} error={show("fullName")} />
                <Field label="Address" value={address.address} onChange={(v) => setAddress({ address: v })} error={show("address")} />
                <div className="md:col-span-2">
                  <Field label="Apartment, suite, etc. (optional)" value={address.apartment} onChange={(v) => setAddress({ apartment: v })} />
                </div>
                <Field label="City" value={address.city} onChange={(v) => setAddress({ city: v })} error={show("city")} />
                <Field label="State" value={address.state} onChange={(v) => setAddress({ state: v })} error={show("state")} />
                <Field label="Postal Code" value={address.postal} onChange={(v) => setAddress({ postal: v })} />
                <SelectField label="Country" value={address.country} onChange={(v) => setAddress({ country: v })} options={COUNTRIES} error={show("country")} />
              </div>
            </section>
          )}

          {submitted && Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">
              <AlertCircle className="h-4 w-4 mt-[1px] shrink-0" />
              <span>Some required details are missing. Please check the fields marked in red above.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/cart" className="text-[13px] font-semibold underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Return to Cart
            </Link>
            <button
              onClick={handleContinue}
              className="flex-1 md:flex-none md:min-w-[280px] bg-ink text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              Continue to Payment <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Your information is secure and encrypted
          </div>
        </div>
      </CheckoutPage>
      <Toaster position="top-center" />
    </>
  );
}
