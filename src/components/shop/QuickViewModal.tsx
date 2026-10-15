import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Star, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuickView } from "@/lib/quick-view-store";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart-store";
import {
  formatNaira,
  getProductCopy,
  getProductRating,
  getSaleInfo,
  getSizeAvailability,
  getProductSizeLabel,
  isOutOfStock,
  isPriceOnRequest,
} from "@/lib/shop-data";
import { useProduct } from "@/lib/catalog-product-cache";

export function QuickViewModal() {
  const productId = useQuickView((s) => s.productId);
  const close = useQuickView((s) => s.close);
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const wishIds = useWishlist((s) => s.ids);
  const toggleWish = useWishlist((s) => s.toggle);

  const { product } = useProduct(productId);
  const availability = useMemo(() => (product ? getSizeAvailability(product) : {}), [product]);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.sizes.find((s) => availability[s] !== false) ?? null;
    setSize(product.sizes.length === 1 ? product.sizes[0] : firstAvailable);
    setColor(product.colors[0]?.name ?? null);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [productId]);

  if (!product) return null;

  const por = isPriceOnRequest(product);
  const oos = !por && isOutOfStock(product);
  const { originalPrice, discountPct } = getSaleInfo(product);
  const { rating, reviews } = getProductRating(product.id);
  const { description } = getProductCopy(product);
  const wished = wishIds.includes(product.id);
  const needsSize = product.sizes.length > 0;
  const canAdd = !por && !oos && (!needsSize || (!!size && availability[size] !== false));

  const handleAdd = () => {
    if (!canAdd) return;
    add({
      productId: product.id,
      name: product.name,
      variant: color ?? "",
      size: size ?? undefined,
      color: color ?? undefined,
      price: product.price,
      image: product.image,
      qty: 1,
    });
    close();
    toast("Added to bag");
  };

  return (
    <AnimatePresence>
      {productId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-[2px]"
          />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-3 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="pointer-events-auto w-full max-w-[880px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-background shadow-2xl"
            >
              <div className="relative grid md:grid-cols-2">
                <button
                  onClick={close}
                  aria-label="Close quick view"
                  className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>

                <div className="relative bg-[#f2f2f2] aspect-square md:aspect-auto md:min-h-[420px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-contain p-6"
                  />
                  {discountPct && !por ? (
                    <div className="absolute left-3 top-3 bg-sale text-white text-[10px] font-bold px-2 py-1 rounded-[3px]">
                      -{discountPct}%
                    </div>
                  ) : null}
                </div>

                <div className="p-5 md:p-7">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink">{product.brand}</div>
                  <h2 className="mt-1 text-[18px] font-semibold leading-tight">{product.name}</h2>

                  <div className="flex items-center gap-1 mt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-ink text-ink" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                      />
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-1">
                      {rating} ({reviews})
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    {por ? (
                      <span className="text-[15px] font-bold uppercase tracking-wider text-ink">Price on Request</span>
                    ) : (
                      <>
                        <span className={`text-[20px] font-bold ${originalPrice ? "text-sale" : "text-ink"}`}>
                          {formatNaira(product.price)}
                        </span>
                        {originalPrice && (
                          <span className="text-[12px] text-muted-foreground line-through">
                            {formatNaira(originalPrice)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-4">{description}</p>

                  {product.colors.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                        Colour{color ? `: ${color}` : ""}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setColor(c.name)}
                            title={c.name}
                            className={`h-8 w-8 rounded-full border transition ${
                              color === c.name ? "ring-2 ring-ink ring-offset-2" : "border-border"
                            }`}
                            style={{
                              background:
                                c.hex === "linear"
                                  ? "conic-gradient(from 180deg, #000 0deg, #fff 90deg, #c44569 180deg, #2d5a3d 270deg, #000 360deg)"
                                  : c.hex,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {needsSize && (
                    <div className="mt-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Size</div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => {
                          const soldOut = availability[s] === false;
                          return (
                            <button
                              key={s}
                              disabled={soldOut}
                              onClick={() => setSize(s)}
                              className={`w-16 h-9 px-1.5 rounded-lg text-[10px] font-semibold truncate border transition ${
                                soldOut
                                  ? "border-border text-muted-foreground line-through opacity-50"
                                  : size === s
                                  ? "bg-ink text-white border-ink"
                                  : "border-border text-ink"
                              }`}
                            >
                              {getProductSizeLabel(product, s, product.sizeLabels)}
                            </button>
                          );
                        })}
                      </div>
                      {product.modelFit && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{product.modelFit}</p>}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2">
                    {por ? (
                      <button
                        onClick={() => {
                          close();
                          navigate({ to: "/start-request" });
                        }}
                        className="flex-1 h-12 rounded-lg bg-ink text-white text-[12px] font-bold uppercase tracking-widest"
                      >
                        Request this piece
                      </button>
                    ) : (
                      <button
                        disabled={!canAdd}
                        onClick={handleAdd}
                        className="flex-1 h-12 rounded-lg bg-ink text-white text-[12px] font-bold uppercase tracking-widest disabled:opacity-40"
                      >
                        {oos ? "Sold out" : canAdd ? "Add to bag" : "Select a size"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        toggleWish(product.id, { size: size ?? undefined, color: color ?? undefined });
                      }}
                      aria-label="Toggle wishlist"
                      className="h-12 w-12 rounded-lg border border-border flex items-center justify-center"
                    >
                      <Heart
                        className={`h-5 w-5 ${wished ? "fill-sale text-sale" : "text-ink"}`}
                        strokeWidth={1.6}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      close();
                      navigate({ to: "/product/$id", params: { id: product.id } });
                    }}
                    className="mt-3 text-[11px] font-semibold uppercase tracking-widest underline underline-offset-4 text-muted-foreground"
                  >
                    View full details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
