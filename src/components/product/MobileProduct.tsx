import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Truck, RefreshCcw, ChevronDown, ChevronUp, CheckCircle2, Info, Minus, Plus, ClipboardList, ArrowRight, X, Bell, BellRing, Lock, MessageCircle, Share } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import {
  formatNaira, isConciergeProduct, isPriceOnRequest, getProductGallery, getProductCopy,
  getProductRating, getSaleInfo, getSizeAvailability, getProductSizeLabel, isOutOfStock, type Product,
} from "@/lib/shop-data";
import { useRelatedProducts } from "@/lib/catalog-product-cache";
import { buttonTap } from "@/lib/motion";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist";
import { useNotify } from "@/lib/reviews";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductCard } from "@/components/shop/ProductCard";
import { DropReserveBlock } from "@/components/product/DropReserveBlock";
import type { Drop } from "@/lib/coming-soon";
import { goToLabel } from "@/lib/nav-resolve";
import { shareProduct } from "@/lib/product-sharing";
import { useSizeGuideFor } from "@/lib/size-guide-store";


export function MobileProduct({ product, forceConcierge = false, drop }: { product: Product; forceConcierge?: boolean; drop?: Drop }) {
  const navigate = useNavigate();
  const sizeAvail = getSizeAvailability(product);
  const guide = useSizeGuideFor(product.brandHandle ?? product.brand, product.category);
  const firstAvailable = product.sizes.find((s) => sizeAvail[s]) ?? product.sizes[0];
  const [selectedSize, setSelectedSize] = useState(firstAvailable);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const wish = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const addToCart = useCart((s) => s.add);
  const notified = useNotify((s) => Boolean(s.items[product.id]));
  const notifyAdd = useNotify((s) => s.add);
  const notifyRemove = useNotify((s) => s.remove);

  const [slide, setSlide] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<Record<string, boolean>>({ Authentic: true });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const por = !drop && isPriceOnRequest(product);
  const concierge = !drop && (forceConcierge || por || isConciergeProduct(product));
  const oos = !drop && !concierge && isOutOfStock(product);



  const gallery = getProductGallery(product);
  const related = useRelatedProducts(product.id, 8);
  const { originalPrice, discountPct } = getSaleInfo(product);
  const { description, features, styleCode } = getProductCopy(product);
  const { rating, reviews } = getProductRating(product.id);


  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      variant: selectedColor || product.colors[0]?.name || "",
      size: selectedSize,
      color: selectedColor || product.colors[0]?.name,
      price: product.price,
      image: product.image,
      qty,
    });
    toast.success("Added to cart");
  };

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const handleShare = async () => {
    const result = await shareProduct(product);
    if (result === "copied") toast.success("Product link copied");
    if (result === "unavailable") toast.error("Sharing is not available");
  };

  return (
    <MobileShell activeBottom={concierge ? "shop" : "shop"} showTopTabs={false} headerVariant="shop" bottomVariant="product" onBack={() => window.history.back()}>
      <div className="bg-background pb-8">


        {/* Gallery */}
        <div ref={galleryRef} className="relative bg-[#f2f2f2] aspect-square overflow-hidden">
          {!concierge && discountPct && (
            <div className="absolute top-3 left-3 z-10 bg-sale text-white text-[10px] font-bold px-2 py-1 rounded-[3px]">
              -{discountPct}%
            </div>
          )}
          <motion.div
            className="absolute inset-0 flex touch-pan-y"
            style={{ width: `${gallery.length * 100}%` }}
            drag={gallery.length > 1 && width > 0 ? "x" : false}
            dragConstraints={{ left: -width * (gallery.length - 1), right: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            animate={{ x: -slide * width }}
            transition={{ type: "spring", stiffness: 500, damping: 45, mass: 0.6 }}
            onDragEnd={(_, info) => {
              const threshold = width * 0.2;
              const projected = info.offset.x + info.velocity.x * 0.15;
              if (projected < -threshold) setSlide((s) => Math.min(s + 1, gallery.length - 1));
              else if (projected > threshold) setSlide((s) => Math.max(s - 1, 0));
              else setSlide((s) => s);
            }}
          >
            {gallery.map((src, i) => (
              <div key={i} className="h-full shrink-0" style={{ width: `${100 / gallery.length}%` }}>
                <img
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  draggable={false}
                  className="w-full h-full object-contain p-6 pointer-events-none select-none"
                />
              </div>
            ))}
          </motion.div>


          {gallery.length > 1 && (
            <div className="absolute z-10 bottom-3 right-3 bg-white/95 text-ink text-[10px] font-semibold px-2.5 py-1 rounded-full">
              {slide + 1}/{gallery.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip below the main image */}
        {gallery.length > 1 && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-16 w-16 shrink-0 rounded-[4px] overflow-hidden bg-[#f2f2f2] transition-all ${
                  i === slide ? "border-2 border-ink" : "border border-border"
                }`}
              >
                <img
                  src={src}
                  alt={`${product.name} thumbnail ${i + 1}`}
                  draggable={false}
                  className="w-full h-full object-contain p-1.5 pointer-events-none select-none"
                />
              </button>
            ))}
          </div>
        )}



        <div className="px-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold tracking-widest text-muted-foreground">{product.brand}</div>
              <h1 className="font-display font-bold text-xl leading-tight text-ink mt-1">
                {product.name.replace(" - ", " ")}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => { toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined }); }}
                aria-label="Add to wishlist"
                className="grid h-10 w-10 place-items-center text-ink"
              >
                <Heart className={`h-6 w-6 ${wish ? "fill-sale text-sale" : ""}`} strokeWidth={1.5} />
              </button>
              <button onClick={handleShare} aria-label="Share this product" className="grid h-10 w-10 place-items-center text-ink">
                <Share className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-ink">
              {[0,1,2,3,4].map(i => (
                <svg key={i} viewBox="0 0 20 20" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <polygon points="10,1 12.6,7.5 19.5,7.5 14,11.9 16,18.5 10,14.5 4,18.5 6,11.9 0.5,7.5 7.4,7.5"/>
                </svg>
              ))}
            </div>
            <span className="text-[11px] font-medium text-ink">{rating}</span>
            <span className="text-[11px] text-muted-foreground">({reviews} reviews)</span>
          </div>

          {por ? (
            <div className="mt-3 rounded-[4px] bg-muted/60 border border-border px-3 py-2.5">
              <div className="text-[12px] font-bold uppercase tracking-widest text-ink">Price on Request</div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                This item is available on request.<br />Contact our concierge team for pricing and availability.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-baseline gap-3">
                <div className={`text-xl font-bold ${discountPct ? "text-sale" : "text-ink"}`}>{formatNaira(product.price)}</div>
                {!concierge && originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">{formatNaira(originalPrice)}</div>
                )}
              </div>
              {concierge && (
                <div className="text-[11px] text-ink font-semibold mt-1">Available on Request</div>
              )}
            </>
          )}



          {!concierge ? (
            <>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-semibold uppercase tracking-wide">SIZE</div>
                  <button onClick={() => setSizeGuideOpen(true)} className="text-[11px] text-muted-foreground underline underline-offset-2">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.slice(0, 12).map((s) => {
                    const available = sizeAvail[s];
                    const active = selectedSize === s;
                    return (
                      <button
                        key={s}
                        disabled={!available}
                        onClick={() => setSelectedSize(s)}
                        className={`w-16 h-9 px-1.5 rounded-[3px] border text-[10px] font-semibold truncate relative ${
                          !available
                            ? "bg-muted/40 border-border text-muted-foreground line-through cursor-not-allowed"
                            : active
                            ? "bg-ink text-white border-ink"
                            : "bg-background border-border"
                        }`}
                      >
                        {getProductSizeLabel(product, s, product.sizeLabels)}
                      </button>
                    );
                  })}
                </div>
                {product.modelFit && (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{product.modelFit}</p>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {guide?.note || (product.category === "footwear" ? "Measure your foot from heel to toe and match to the closest length." : product.category === "clothing" ? "Measurements in inches. For best fit, compare with a garment you already own." : "One size fits most.")}
                </p>
              </div>
              {product.colors.length > 0 && (
                <div className="mt-5">
                  <div className="text-[12px] font-semibold mb-2">
                    Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={c.name}
                        className={`h-9 w-9 rounded-full border grid place-items-center transition-all ${
                          selectedColor === c.name ? "ring-1 ring-offset-2 ring-ink border-ink" : "border-border"
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
              {oos ? (
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-sale font-medium">
                  <Info className="h-4 w-4" /> Sold out - we'll notify you when it's back
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-ink font-medium">
                  <CheckCircle2 className="h-4 w-4" /> In stock and ready to ship
                </div>
              )}
            </>

          ) : (
            <div className="mt-5">
              <div className="text-[12px] font-semibold mb-2">
                Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    aria-label={c.name}
                    className={`h-9 w-9 rounded-full border transition-all ${
                      selectedColor === c.name ? "ring-1 ring-offset-2 ring-ink border-ink" : "border-border"
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
              <div className="flex items-center gap-4 mt-4">
                <span className="text-[12px] font-semibold text-ink">Qty</span>
                <div className="flex items-center border border-border rounded-[3px]">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-10 w-12 grid place-items-center text-[13px] font-semibold border-x border-border">{qty}</div>
                  <button onClick={() => setQty(Math.min(10, qty + 1))} className="h-10 w-10 grid place-items-center">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTAs - always visible under product details */}
        {drop ? (
          <div className="px-4">
            <DropReserveBlock drop={drop} product={product} size={selectedSize} color={selectedColor} />
          </div>
        ) : concierge ? (
          <div className="px-4 mt-5 space-y-3">
            <div className="flex gap-2">
              <motion.button
                whileTap="tap"
                variants={buttonTap}
                onClick={() => { toast("Added to your request"); navigate({ to: "/start-request", search: { productId: product.id } }); }}
                className="flex-1 h-12 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2"
              >
                <ClipboardList className="h-4 w-4" /> Add to Request
              </motion.button>
              <motion.button
                whileTap="tap"
                variants={buttonTap}
                onClick={() => { toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined }); }}
                className="h-12 w-12 border border-border rounded-[3px] grid place-items-center"
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : ""}`} />
              </motion.button>
            </div>
            {por && (
              <motion.button
                whileTap="tap"
                variants={buttonTap}
                onClick={() => goToLabel("Chat with Us (WhatsApp)")}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-ink bg-background text-[12px] font-bold uppercase tracking-widest text-ink"
              >
                <MessageCircle className="h-4 w-4" /> Chat with Concierge
              </motion.button>
            )}
            <div className="flex items-start gap-3 border border-border rounded-lg p-3 bg-muted/40">
              <Info className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-ink">This is a concierge / pre-order item</div>
                <div className="text-[11px] text-muted-foreground">We will source and deliver this item for you.</div>
              </div>
              <button onClick={() => navigate({ to: "/how-it-works" })} className="text-[11px] font-semibold text-ink flex items-center gap-1 whitespace-nowrap">
                How It Works <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : oos ? (
          <div className="px-4 mt-5 space-y-2.5">
            <motion.button
              whileTap="tap"
              variants={buttonTap}
              onClick={() => {
                if (notified) { notifyRemove(product.id); }
                else { notifyAdd(product.id); toast.success("We'll email you when this is back"); }
              }}
              className="w-full h-12 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2"
            >
              {notified ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {notified ? "Notify: On" : "Notify Me When Back"}
            </motion.button>
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => { toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined }); }} className="w-full h-12 bg-background border border-border text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2">
              <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : ""}`} /> Save to Wishlist
            </motion.button>
          </div>
        ) : (
          <div className="px-4 mt-5 space-y-2.5">
            <motion.button whileTap="tap" variants={buttonTap} onClick={handleAddToCart} className="w-full h-12 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </motion.button>
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => { handleAddToCart(); navigate({ to: "/checkout/information" }); }} className="w-full h-12 bg-background border border-ink text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px]">
              Buy Now
            </motion.button>
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => { toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined }); }} className="w-full h-12 bg-background border border-border text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2">
              <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : ""}`} /> Add to Wishlist
            </motion.button>
          </div>
        )}


        {/* Product Details accordion */}
        <div className="px-4 mt-8">
          <div className="border border-border rounded-lg">
            <button onClick={() => toggle("Details")} className="w-full flex items-center gap-3 px-4 py-3">
              <ClipboardList className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left text-[12px] font-bold uppercase tracking-widest">Product Details</span>
              {open["Details"] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open["Details"] && (
              <div className="px-4 pb-4">
                <p className="text-[13px] leading-relaxed text-foreground/85">{description}</p>
                <ul className="mt-3 space-y-1.5 text-[12.5px] text-foreground/85">
                  {features.map((f) => (
                    <li key={f} className="flex gap-2"><span className="text-ink">•</span> {f}</li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <div><div className="text-muted-foreground">Brand</div><div className="font-semibold text-ink">{product.brand}</div></div>
                  <div><div className="text-muted-foreground">Color</div><div className="font-semibold text-ink">{selectedColor || " - "}</div></div>
                  <div><div className="text-muted-foreground">Style Code</div><div className="font-semibold text-ink">{styleCode}</div></div>
                  <div><div className="text-muted-foreground">Condition</div><div className="font-semibold text-ink">Brand New</div></div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Trust / policy accordions - shown on all product pages including drops */}
        {(
          <div className="px-4 mt-8 space-y-3">
            {[
              { key: "Authentic", Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", body: "All items are sourced from trusted suppliers. 100% authentic or your money back. Every item is verified by our experts for authenticity." },
              { key: "Shipping", Icon: Truck, title: "SHIPPING", body: "Free shipping on orders over ₦1,000,000. Next-day delivery available. Orders are typically processed within 1 - 2 working days. Delivery times may vary depending on your location and the delivery option selected at checkout. Nationwide delivery available." },
              { key: "Returns", Icon: RefreshCcw, title: "EASY RETURNS", body: "Eligible items may be returned or exchanged within 7 days of delivery. Items must be unworn, unwashed, unused and returned in their original condition and packaging." },
              { key: "Payment", Icon: Lock, title: "SECURE PAYMENTS", body: "Shop with confidence. Your payment information is securely protected, with multiple trusted payment options available for a safe and seamless checkout." },
            ].map(({ key, Icon, title, body }) => (
              <div key={key} className="border border-border rounded-lg">
                <button onClick={() => toggle(key)} className="w-full flex items-center gap-3 px-4 py-3">
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span className="flex-1 text-left text-[12px] font-bold uppercase tracking-widest">{title}</span>
                  {open[key] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {open[key] && (
                  <div className="px-4 pb-4 text-[12px] text-muted-foreground leading-relaxed">{body}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reviews accordion - hidden on coming-soon drop pages */}
        {!drop && (
        <div className="px-4 mt-3">
          <div className="border border-border rounded-lg">
            <button onClick={() => toggle("Reviews")} className="w-full flex items-center gap-3 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left text-[12px] font-bold uppercase tracking-widest">Reviews</span>
              {open["Reviews"] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {open["Reviews"] && (
              <div className="px-4 pb-4">
                <ProductReviews productId={product.id} compact />
              </div>
            )}
          </div>
        </div>
        )}



        {/* You May Also Like */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="px-4 text-[12px] font-bold uppercase tracking-widest text-ink mb-4">You May Also Like</div>
            <div className="overflow-x-auto no-scrollbar px-4 pb-8">
              <div className="flex gap-3 pr-4" style={{ width: "max-content" }}>
                {related.map((p) => (
                  <div key={p.id} className="w-[150px] shrink-0">
                    <ProductCard product={p} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 flex items-end"
            onClick={() => setSizeGuideOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background rounded-t-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-background flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Size Guide</div>
                  <div className="text-[14px] font-bold text-ink">{product.category === "footwear" ? "Footwear Sizing" : product.category === "clothing" ? "Apparel Sizing" : "Sizing"}</div>
                </div>
                <button onClick={() => setSizeGuideOpen(false)} className="h-9 w-9 grid place-items-center rounded-full bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-4 py-4">
                {guide?.note && <p className="text-[12px] text-muted-foreground mb-3">{guide.note}</p>}
                {product.category === "footwear" ? (
                  <>
                    <p className="text-[12px] text-muted-foreground mb-3">Measure your foot from heel to toe and match to the closest length below.</p>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                          <th className="py-2">EU</th><th className="py-2">UK</th><th className="py-2">US</th><th className="py-2">CM</th>
                        </tr>
                      </thead>
                      <tbody className="text-ink">
                        {[
                          ["39","6","7","24.5"],["40","6.5","7.5","25"],["41","7.5","8.5","26"],
                          ["42","8","9","26.5"],["43","9","10","27.5"],["44","9.5","10.5","28"],
                          ["45","10.5","11.5","29"],["46","11","12","29.5"],
                        ].map(r => (
                          <tr key={r[0]} className="border-b border-border/60">
                            {r.map((v,i) => <td key={i} className="py-2 font-medium">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : product.category === "clothing" ? (
                  <>
                    <p className="text-[12px] text-muted-foreground mb-3">{product.modelFit || "Measurements in inches. For best fit, compare with a garment you already own."}</p>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                          <th className="py-2">Size</th><th className="py-2">Chest</th><th className="py-2">Waist</th><th className="py-2">Length</th>
                        </tr>
                      </thead>
                      <tbody className="text-ink">
                        {[
                          ["XS","34","28","26"],["S","36","30","27"],["M","39","32","28"],
                          ["L","42","34","29"],["XL","45","37","30"],["XXL","48","40","31"],
                        ].map(r => (
                          <tr key={r[0]} className="border-b border-border/60">
                            {r.map((v,i) => <td key={i} className="py-2 font-medium">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="text-[12px] text-muted-foreground">One size fits most. If you have questions, contact our concierge team.</p>
                )}
                <div className="mt-5 rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-ink">Between sizes?</span>{" "}
                  We recommend sizing up for a relaxed fit or down for a snug fit.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileShell>
  );
}
