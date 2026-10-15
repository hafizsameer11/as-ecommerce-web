import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Minus, Plus, X, ArrowRight, ShoppingBag, AlertTriangle, CircleCheck } from "lucide-react";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { naira } from "@/components/checkout/checkoutData";
import { useCart, type CartItem } from "@/lib/cart-store";
import { getSizeAvailability, getProductSizeLabel, isOutOfStock, type Product } from "@/lib/shop-data";
import { useProductsByIds } from "@/lib/catalog-product-cache";
import { useCheckout } from "@/lib/checkout-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart - ASL ORIGINALS" },
      { name: "description", content: "Review the items in your cart and continue to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const lines = useCart((s) => s.items);
  const productIds = useMemo(() => lines.map((l) => l.productId), [lines]);
  const { products: cartProducts } = useProductsByIds(productIds);
  const productById = useMemo(
    () => new Map<string, Product>(cartProducts.map((p) => [p.id, p])),
    [cartProducts]
  );
  const lineProduct = (l: CartItem) => productById.get(l.productId);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);
  const addItem = useCart((s) => s.add);
  const couponCode = useCheckout((s) => s.coupon);
  const discountPct = useCheckout((s) => s.discountPct);
  const applyCoupon = useCheckout((s) => s.applyCoupon);
  const removeCoupon = useCheckout((s) => s.removeCoupon);
  const [coupon, setCoupon] = useState(couponCode ?? "");
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);


  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = Math.round(subtotal * (discountPct / 100));
  const total = subtotal - discount;

  const sizeOptions = (l: CartItem) => {
    const product = lineProduct(l);
    if (!product || product.sizes.length === 0) return [{ value: l.size!, label: l.size!, soldOut: false }];
    const availability = getSizeAvailability(product);
    return product.sizes.map((s) => ({
      value: s,
      label: getProductSizeLabel(product, s, product.sizeLabels),
      soldOut: availability[s] === false,
    }));
  };

  const lineSoldOut = (l: CartItem) => {
    const product = lineProduct(l);
    if (!product) return false;
    if (isOutOfStock(product)) return true;
    if (!l.size) return false;
    return getSizeAvailability(product)[l.size] === false;
  };

  const soldOutLines = lines.filter(lineSoldOut);
  const hasSoldOut = soldOutLines.length > 0;

  const removeSoldOut = () => {
    soldOutLines.forEach((l) => removeItem(l.id));
    toast("Sold out items removed from your cart");
  };

  const goToCheckout = () => {
    if (hasSoldOut) {
      toast.error("Some items are out of stock. Remove or change them before checkout.");
      return;
    }
    navigate({ to: "/checkout/information" });
  };

  const changeSize = (l: (typeof lines)[number], nextSize: string) => {
    if (nextSize === l.size) return;
    removeItem(l.id);
    addItem({
      productId: l.productId,
      name: l.name,
      variant: l.variant.startsWith("Pre-order") ? l.variant : (l.color ?? ""),
      size: nextSize,
      color: l.color,
      price: l.price,
      image: l.image,
      qty: l.qty,
    });
  };

  const remove = (id: string) => {
    removeItem(id);
  };

  const onApply = async () => {
    const res = await applyCoupon(coupon);
    if (res.ok) {
      setCouponSuccess(`Coupon applied - ${res.pct}% off`);
    } else {
      setCouponSuccess(null);
      toast.error(res.message);
    }
  };

  return (
    <>
      <CheckoutPage title="Cart" step={1} hideSummary>
        <div className="grid gap-5 lg:grid-cols-[1fr_400px] lg:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex items-baseline justify-between">
                <h1 className="font-sans text-xl md:text-2xl font-bold">1. Your Cart</h1>
                <span className="text-[12px] text-muted-foreground">{lines.length} Items</span>
              </div>

              {hasSoldOut && (
                <div className="mt-4 rounded-lg border border-ink bg-ink text-white p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold uppercase tracking-wide">
                        {soldOutLines.length} item{soldOutLines.length > 1 ? "s" : ""} out of stock
                      </div>
                      <p className="mt-1 text-[12px] text-white/80 leading-relaxed">
                        Choose another size or remove them before you continue to checkout.
                      </p>
                      <button
                        onClick={removeSoldOut}
                        className="mt-2.5 h-8 px-3 rounded bg-white text-ink text-[11px] font-bold uppercase tracking-wide"
                      >
                        Remove sold out items
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 divide-y divide-border border-y border-border">
                {lines.map((l) => {
                  const soldOut = lineSoldOut(l);
                  const brand = lineProduct(l)?.brand;
                  return (
                  <div key={l.id} className="flex items-start gap-3 md:gap-4 py-2 md:py-3 min-w-0">
                    <img src={l.image} alt={l.name} className={`h-12 w-12 md:h-[72px] md:w-[72px] rounded-md object-contain bg-[#f2f2f2] shrink-0 ${soldOut ? "opacity-50 grayscale" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          {brand && (
                            <div className="text-[9px] md:text-[10px] font-semibold uppercase text-muted-foreground leading-tight">
                              {brand}
                            </div>
                          )}
                          <div className="text-[13px] md:text-[14px] font-semibold leading-snug">{l.name}</div>
                          <div className="text-[11px] md:text-[12px] text-muted-foreground truncate">
                            {l.color ? `Color: ${l.color}` : l.variant}
                          </div>
                          {l.variant.startsWith("Pre-order") && (
                            <div className="text-[10.5px] md:text-[11px] text-muted-foreground/80 truncate">{l.variant}</div>
                          )}
                          {soldOut && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-[3px] bg-ink px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                              Out of stock
                            </div>
                          )}
                        </div>
                        <div className="text-[13px] md:text-[14px] font-semibold whitespace-nowrap shrink-0">{naira(l.price * l.qty)}</div>
                        <button onClick={() => remove(l.id)} aria-label="Remove" className="text-muted-foreground hover:text-foreground p-1 shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2 md:gap-3">
                        {l.size && (
                      <label className="flex items-center gap-1.5 text-[10px] md:text-[11px] text-muted-foreground min-w-0">
                            <span className="shrink-0">Size:</span>
                            <Select
                                value={l.size}
                                onValueChange={(value) => changeSize(l, value)}
                              >
                              <SelectTrigger
                                className={`h-7 w-[84px] rounded border bg-background px-2 py-0 text-[10px] font-normal leading-none shadow-none focus:ring-1 focus:ring-ink [&>svg]:h-3 [&>svg]:w-3 ${soldOut ? "border-ink" : "border-border"}`}
                                aria-label={`Change size for ${l.name}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="min-w-[84px]">
                                {sizeOptions(l).map((s) => (
                                  <SelectItem key={s.value} value={s.value} disabled={s.soldOut} className="py-1.5 pl-2 pr-7 text-[11px]">
                                    {s.label}{s.soldOut ? " (Sold out)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </label>
                        )}
                        <div className="flex items-center h-8 border border-border rounded ml-auto shrink-0">
                          <button onClick={() => setQty(l.id, l.qty - 1)} className="h-full px-2 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                          <div className="px-1.5 md:px-2.5 text-[13px] font-medium min-w-[1.25rem] md:min-w-[1.75rem] text-center">{l.qty}</div>
                          <button onClick={() => setQty(l.id, l.qty + 1)} className="h-full px-2 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
                {lines.length === 0 && (
                  <div className="py-16 text-center">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" strokeWidth={1.25} />
                    <div className="text-sm text-muted-foreground mb-4">Your cart is empty.</div>
                    <Link to="/shop" className="inline-flex h-9 px-5 items-center rounded bg-ink text-white text-[12px] font-semibold">Continue Shopping</Link>
                  </div>
                )}
              </div>
            </div>

            {lines.length > 0 && (
              <>
                <div className="border border-border rounded-md p-3 bg-card space-y-1.5 text-[12px] md:text-[13px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{naira(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-foreground font-bold"><span>Discount ({couponCode})</span><span>- {naira(discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-muted-foreground">Calculated at next step</span></div>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold text-[15px]"><span>Total</span><span>{naira(total)}</span></div>
                </div>

                <div className="space-y-1 max-w-md">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Promo code
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") onApply(); }}
                      placeholder="Enter promo code"
                      className="min-w-0 flex-1 h-8 rounded bg-muted px-2.5 text-[11px] placeholder:text-[11px] placeholder:text-muted-foreground/80 focus:outline-none focus:ring-1 focus:ring-ink"
                    />
                    <button
                      onClick={onApply}
                      className="h-8 px-3 rounded bg-ink text-white text-[11px] font-semibold hover:opacity-90 shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {couponCode && (
                  <div className="space-y-3">
                    {couponSuccess && (
                      <div role="status" className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2.5 text-[12px] font-semibold text-foreground shadow-sm">
                        <CircleCheck className="h-4 w-4 shrink-0" />
                        <span>{couponSuccess}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded bg-ink px-3 py-2.5 text-white">
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold truncate">{couponCode}</div>
                        <div className="text-[10.5px] text-white/80">{discountPct}% off applied</div>
                      </div>
                      <button
                        onClick={() => { removeCoupon(); setCoupon(""); setCouponSuccess(null); }}
                        className="shrink-0 p-1 hover:bg-white/10 rounded"
                        aria-label="Remove coupon"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  By placing your order, you agree to our{" "}
                  <Link to="/customer-care/terms-of-service" className="underline text-foreground">Terms and Conditions</Link>{" "}
                  and confirm that you read and understood our{" "}
                  <Link to="/customer-care/privacy-policy" className="underline text-foreground">Privacy Policy</Link>.
                </p>


                <button
                  onClick={goToCheckout}
                  disabled={hasSoldOut}
                  className="w-full bg-ink text-white py-3 rounded-md text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Information <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {lines.length > 0 && (
            <aside className="hidden lg:block min-w-0">
              <OrderSummary shipping={0} shippingLabel="Calculated at next step" discount={discount} discountCode={couponCode ?? "ASL20OFF"} />
            </aside>
          )}
        </div>
      </CheckoutPage>
    </>
  );
}
