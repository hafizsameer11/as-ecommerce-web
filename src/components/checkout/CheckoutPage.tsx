import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, ShoppingBag } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { useCartCount, useCartSubtotal } from "@/lib/cart-store";
import { useCheckout, shippingFor, checkoutTotalFallback } from "@/lib/checkout-store";
import { CheckoutStepper } from "./CheckoutStepper";
import { OrderSummary } from "./OrderSummary";

function ConnectedOrderSummary() {
  const coupon = useCheckout((s) => s.coupon);
  const discountAmount = useCheckout((s) => s.discountAmount);
  const discountPct = useCheckout((s) => s.discountPct);
  const delivery = useCheckout((s) => s.delivery);
  const address = useCheckout((s) => s.address);
  const totalAmount = useCheckout((s) => s.totalAmount);
  const subtotal = useCartSubtotal();
  const discount = discountAmount > 0 ? Math.round(discountAmount) : Math.round(subtotal * (discountPct / 100));
  const shipping = shippingFor(delivery, address.state);
  const total = checkoutTotalFallback(subtotal, discount, shipping);
  return (
    <OrderSummary
      discount={discount}
      discountCode={coupon ?? "ASL20OFF"}
      shipping={shipping}
      totalOverride={totalAmount > 0 ? totalAmount : total}
    />
  );
}

/**
 * Two-column shell for checkout on desktop. On mobile it renders a phone-style
 * header (back button + title + cart) and stacks content, with the summary
 * either at top (Payment/Review/Place) or bottom (Cart/Information).
 */
export function CheckoutPage({
  title,
  step,
  showPlace = false,
  children,
  mobileSummaryPosition = "bottom",
  summary,
  hideSummary = false,
}: {
  title: string;
  step: 1 | 2 | 3 | 4 | 5;
  showPlace?: boolean;
  children: ReactNode;
  mobileSummaryPosition?: "top" | "bottom";
  summary?: ReactNode;
  hideSummary?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const count = useCartCount();
  const SummaryEl = summary ?? <ConnectedOrderSummary />;

  if (isDesktop) {
    return (
      <DesktopShell active="Cart">
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <CheckoutStepper current={step} showPlace={showPlace} />
          <div className={`mt-6 grid gap-6 ${hideSummary ? "" : "lg:grid-cols-[1fr_380px]"}`}>
            <div className="min-w-0">{children}</div>
            {!hideSummary && <aside className="min-w-0">{SummaryEl}</aside>}
          </div>
        </div>
      </DesktopShell>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-2.5">
          <button onClick={() => navigate({ to: "/shop" })} aria-label="Close cart" className="text-foreground">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="text-center font-display font-bold text-base tracking-wider">{title}</div>
          <button onClick={() => navigate({ to: "/cart" as any })} aria-label="Cart" className="relative">
            <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-white text-[9px] font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
        <div className="px-3 pb-3">
          <CheckoutStepper current={step} showPlace={showPlace} />
        </div>
      </div>

      <div className="px-3 py-3 space-y-3">
        {!hideSummary && mobileSummaryPosition === "top" && SummaryEl}
        {children}
        {!hideSummary && mobileSummaryPosition === "bottom" && SummaryEl}
      </div>
    </div>
  );
}
