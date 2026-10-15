import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Truck, RotateCcw, Lock, ChevronDown } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { cartLines as fallbackLines, naira } from "./checkoutData";
import { useCart } from "@/lib/cart-store";
import { formatCartSize, getProductById, getProductSizeLabel } from "@/lib/shop-data";
import { PaymentBrandLogos } from "./PaymentBrandLogos";


export function OrderSummary({
  variant = "sidebar",
  discountCode = "ASL20OFF",
  discount = 0,
  shipping = 0,
  shippingLabel,
  showTrust = true,
  editHref = "/cart",
}: {
  variant?: "sidebar" | "mobile";
  discountCode?: string;
  discount?: number;
  shipping?: number;
  shippingLabel?: string;
  showTrust?: boolean;
  editHref?: string;
}) {
  const storeItems = useCart((s) => s.items);
  const lines = storeItems.length > 0 ? storeItems : fallbackLines;
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const total = subtotal - discount + shipping;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const shipLabel = shippingLabel ?? (shipping === 0 ? "Free" : naira(shipping));
  const [open, setOpen] = useState(false);

  return (
    <div className={variant === "sidebar" ? "bg-muted/40 border border-border rounded-md p-3 space-y-2.5 md:space-y-3" : "space-y-2.5 md:space-y-3"}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 font-semibold text-[13px] text-left"
        >
          Order Summary ({count} items)
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? (
          <Link to={editHref} className="text-[12px] font-semibold underline underline-offset-2 shrink-0">Edit Cart</Link>
        ) : (
          <span className="text-[13px] font-semibold shrink-0">{naira(total)}</span>
        )}
      </div>


      {open && (
        <div className="divide-y divide-border">
          {lines.map((l) => {
            const product = l.productId ? getProductById(l.productId) : undefined;
            const sizeLabel = l.size
              ? product
                ? getProductSizeLabel(product, l.size)
                : formatCartSize(l.size)
              : null;

            return (
              <div key={l.id} className="flex items-start gap-3 py-3">
                <img src={l.image} alt={l.name} className="h-14 w-14 rounded-md object-contain bg-[#f2f2f2] shrink-0" />
                <div className="flex-1 min-w-0 pr-1">
                  {product?.brand && (
                    <div className="text-[9px] font-semibold uppercase text-muted-foreground leading-tight">
                      {product.brand}
                    </div>
                  )}
                  <div className="text-[13px] font-medium leading-snug">{l.name}</div>
                  <div className="text-[10px] md:text-[11px] leading-snug text-muted-foreground">{l.color ? `Color: ${l.color}` : l.variant}</div>
                  <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{sizeLabel ? `Size: ${sizeLabel} · ` : ""}Qty: {l.qty}</div>
                </div>
                <div className="text-[13px] font-semibold whitespace-nowrap">{naira(l.price)}</div>
              </div>
            );
          })}
        </div>
      )}



      <div className="space-y-2 pt-1 border-t border-border">
        <div className="flex justify-between text-[13px]">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{naira(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[13px] text-ink font-bold">
            <span>Discount ({discountCode})</span>
            <span>- {naira(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px]">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{shipLabel}</span>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-border">
          <span className="font-sans font-bold text-[15px]">Total</span>
          <span className="font-semibold text-base">{naira(total)}</span>
        </div>
      </div>

      {discount > 0 && (
        <div className="rounded-md bg-ink text-white border border-ink px-3 py-2 text-[12px] font-semibold">
          You saved {naira(discount)} with code {discountCode}.
        </div>
      )}

      {showTrust && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-border">
          {[
            { Icon: StrokeRosetteCheckIcon, t: "100% Authentic Guaranteed", d: "Every item is carefully sourced and verified." },
            { Icon: Truck, t: "Free Shipping", d: "On orders over ₦50,000" },
            { Icon: RotateCcw, t: "Easy Returns", d: "7-day return or exchange on eligible items." },
            { Icon: Lock, t: "Secure Payment", d: "Your payment information is safe with us." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex gap-2">
              <Icon className="h-4 w-4 mt-0.5 text-foreground" strokeWidth={1.75} />
              <div>
                <div className="text-[12px] font-semibold">{t}</div>
                <div className="text-[10px] leading-snug text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
          <div className="col-span-2 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-sm bg-muted/40 px-2.5 py-2">
            <span className="text-[12px] font-semibold text-foreground">We accept</span>
            <PaymentBrandLogos />
          </div>


        </div>
      )}
    </div>
  );
}
