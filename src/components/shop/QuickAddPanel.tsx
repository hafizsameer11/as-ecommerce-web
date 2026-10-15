import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuickAdd } from "@/lib/quick-add-store";
import { useCart } from "@/lib/cart-store";
import { formatNaira, getProductById, getProductSizeLabel, getSaleInfo, getSizeAvailability } from "@/lib/shop-data";
export function QuickAddPanel() {
  const productId = useQuickAdd((s) => s.productId);
  const close = useQuickAdd((s) => s.close);
  const add = useCart((s) => s.add);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const product = productId ? getProductById(productId) : undefined;
  const availability = useMemo(() => (product ? getSizeAvailability(product) : {}), [product]);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const firstAvailable = product.sizes.find((s) => availability[s] !== false) ?? null;
    setSize(product.sizes.length === 1 ? product.sizes[0] : firstAvailable);
    setColor(product.colors[0]?.name ?? null);
    setQty(1);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [productId]);

  if (!product) return null;

  const { originalPrice } = getSaleInfo(product);
  const needsSize = product.sizes.length > 0;
  const canAdd = !needsSize || (!!size && availability[size] !== false);

  const handleAdd = (goToCart?: boolean) => {
    if (!canAdd) return;
    add({
      productId: product.id,
      name: product.name,
      variant: color ?? "",
      size: size ?? undefined,
      color: color ?? undefined,
      price: product.price,
      image: product.image,
      qty,
    });
    close();
    if (goToCart) navigate({ to: "/cart" });
    else toast("Added to bag");
  };

  const Body = (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex gap-3">
          <div className="h-20 w-20 shrink-0 rounded-lg bg-[#f2f2f2] overflow-hidden">
            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-widest text-ink uppercase">{product.brand}</div>
            <div className="text-[13px] font-medium leading-tight mt-0.5">{product.name}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-[14px] font-bold ${originalPrice ? "text-sale" : "text-ink"}`}>
                {formatNaira(product.price)}
              </span>
              {originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through">{formatNaira(originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={close} aria-label="Close" className="h-8 w-8 rounded-full border border-border flex items-center justify-center shrink-0">
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
        {product.colors.length > 0 && (
          <div className="mb-5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
              Colour{color ? `: ${color}` : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border transition ${color === c.name ? "ring-2 ring-ink ring-offset-2" : "border-border"}`}
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
          <div className="mb-5">
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

        <div className="mb-5">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">Quantity</div>
          <div className="inline-flex items-center border border-border rounded-lg">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 flex items-center justify-center">
              <Minus className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <span className="w-10 text-center text-[13px] font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="h-11 w-11 flex items-center justify-center">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            close();
            navigate({ to: "/product/$id", params: { id: product.id } });
          }}
          className="text-[11px] font-semibold uppercase tracking-widest underline underline-offset-4 text-muted-foreground"
        >
          View full details
        </button>
      </div>

      <div className="border-t border-border px-5 py-4 space-y-2 bg-background">
        <button
          disabled={!canAdd}
          onClick={() => handleAdd(false)}
          className="w-full h-12 rounded-lg bg-ink text-white text-[12px] font-bold uppercase tracking-widest disabled:opacity-40"
        >
          {canAdd ? `Add to bag - ${formatNaira(product.price * qty)}` : "Select a size"}
        </button>
        <button
          disabled={!canAdd}
          onClick={() => handleAdd(true)}
          className="w-full h-12 rounded-lg border border-ink text-ink text-[12px] font-bold uppercase tracking-widest disabled:opacity-40"
        >
          Add & view bag
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {productId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-[2px]"
          />
          {isMobile ? (
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[71] max-h-[88vh] rounded-t-2xl bg-background overflow-hidden flex flex-col"
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
              {Body}
            </motion.div>
          ) : (
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 z-[71] w-[420px] max-w-[92vw] bg-background shadow-2xl flex flex-col"
            >
              {Body}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
