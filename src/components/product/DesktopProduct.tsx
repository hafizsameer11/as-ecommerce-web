import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, ChevronDown, Heart, ShoppingBag, Truck, RefreshCcw, ZoomIn, CheckCircle2, Info, Minus, Plus, ClipboardList, ArrowRight, Bell, BellRing, Lock, MessageCircle, Share, X } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { DropReserveBlock } from "@/components/product/DropReserveBlock";
import type { Drop } from "@/lib/coming-soon";
import {
  formatNaira, isConciergeProduct, isPriceOnRequest, getProductGallery,
  getProductCopy, getProductRating, getSaleInfo, getSizeAvailability, getProductSizeLabel, isOutOfStock, type Product,
} from "@/lib/shop-data";
import { buttonTap } from "@/lib/motion";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist";
import { useNotify } from "@/lib/reviews";
import { ProductReviews } from "@/components/product/ProductReviews";
import { goToLabel } from "@/lib/nav-resolve";
import { shareProduct } from "@/lib/product-sharing";
import { useSizeGuideFor } from "@/lib/size-guide-store";
import { useRelatedProducts } from "@/lib/catalog-product-cache";
import { usePublicSettings } from "@/lib/api/settings";
import { freeShippingThresholdNaira, returnWindowDays } from "@/lib/public-settings-format";

const ALL_TABS = ["PRODUCT DETAILS", "REVIEWS", "SHIPPING", "RETURNS"];

export function DesktopProduct({ product, forceConcierge = false, drop }: { product: Product; forceConcierge?: boolean; drop?: Drop }) {
  const navigate = useNavigate();
  const { data: publicSettings } = usePublicSettings();
  const freeFrom = freeShippingThresholdNaira(publicSettings);
  const returnDays = returnWindowDays(publicSettings);
  const freeFromLabel = new Intl.NumberFormat("en-NG").format(freeFrom);
  const sizeAvail = getSizeAvailability(product);
  const guide = useSizeGuideFor(product.brandHandle ?? product.brand, product.category);
  const firstAvailable = product.sizes.find((s) => sizeAvail[s]) ?? product.sizes[0];
  const [selectedSize, setSelectedSize] = useState(firstAvailable);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [activeTab, setActiveTab] = useState(0);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const wish = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const addToCart = useCart((s) => s.add);
  const notified = useNotify((s) => Boolean(s.items[product.id]));
  const notifyAdd = useNotify((s) => s.add);
  const notifyRemove = useNotify((s) => s.remove);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const por = !drop && isPriceOnRequest(product);
  const concierge = !drop && (forceConcierge || por || isConciergeProduct(product));
  const oos = !drop && !concierge && isOutOfStock(product);
  // No reviews for coming-soon drops - nobody owns the piece yet
  const tabs = drop ? ALL_TABS.filter((t) => t !== "REVIEWS") : ALL_TABS;
  const currentTab = tabs[activeTab] ?? tabs[0];



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

  const gallery = getProductGallery(product);
  const related = useRelatedProducts(product.id, 4);
  const { originalPrice, discountPct } = getSaleInfo(product);
  const { description, features, styleCode } = getProductCopy(product);
  const { rating, reviews } = getProductRating(product.id);
  const handleShare = async () => {
    const result = await shareProduct(product);
    if (result === "copied") toast.success("Product link copied");
    if (result === "unavailable") toast.error("Sharing is not available");
  };



  return (
    <DesktopShell active="Shop">
      <div className="mx-auto max-w-[1600px] px-6 pt-4 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-5">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop/$category" params={{ category: product.category }} className="hover:text-ink capitalize">
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">{product.brand} {product.name}</span>
        </nav>

        <div className="grid grid-cols-[1fr_1fr] gap-6">
          {/* Left column: images + tabs */}
          <div className="flex flex-col gap-6">
            {/* Images row */}
            <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
              {/* Thumbnails */}
              <div className="self-start flex flex-col gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-lg overflow-hidden bg-[#f2f2f2] ${activeImg === i ? "border-2 border-ink" : "border border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
                <button className="flex justify-center py-1 text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Main image */}
              <div className="relative rounded-xl overflow-hidden bg-[#f2f2f2] aspect-square self-start">
                <motion.button
                  whileTap="tap"
                  variants={buttonTap}
                  onClick={() => { toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined }); }}
                  className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white grid place-items-center shadow-sm ring-2 ring-gold"
                >
                  <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : "text-ink"}`} strokeWidth={1.5} />
                </motion.button>
                <button
                  onClick={handleShare}
                  className="absolute top-16 right-3 z-10 h-10 w-10 rounded-full bg-white grid place-items-center shadow-sm"
                  aria-label="Share this product"
                >
                  <Share className="h-4 w-4 text-ink" strokeWidth={1.5} />
                </button>
                <img src={gallery[activeImg]} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-8" />
                <button className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white shadow-sm grid place-items-center" aria-label="Zoom">
                  <ZoomIn className="h-4 w-4 text-ink" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Tabs - directly under image section */}
            <div className="self-start">
              <div className="flex gap-6 border-b border-border">
                {tabs.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(i)}
                    className={`pb-3 text-[12px] font-bold tracking-widest ${activeTab === i ? "text-ink border-b-2 border-ink" : "text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {currentTab === "PRODUCT DETAILS" && (
                <div className="mt-5 text-[13px] leading-relaxed text-foreground/85 space-y-3">
                  <p>{description}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <div className="pt-2 text-[12px]">
                    <div><span className="font-semibold">Brand:</span> {product.brand}</div>
                    <div><span className="font-semibold">Color:</span> {selectedColor || " - "}</div>
                    <div><span className="font-semibold">Style Code:</span> {styleCode}</div>
                    <div><span className="font-semibold">Condition:</span> Brand New</div>
                    {product.modelFit && <div><span className="font-semibold">Model fit:</span> {product.modelFit}</div>}
                  </div>
                </div>
              )}
              {currentTab === "REVIEWS" && (
                <div className="mt-5">
                  <ProductReviews productId={product.id} />
                </div>
              )}
              {currentTab === "SHIPPING" && (
                <div className="mt-5 text-[13px] leading-relaxed text-foreground/85">
                  {`Free shipping on orders over ₦${freeFromLabel}. Orders are processed within 1-2 business days. Estimated delivery: 2-5 business days within Nigeria.`}
                </div>
              )}
              {currentTab === "RETURNS" && (
                <div className="mt-5 text-[13px] leading-relaxed text-foreground/85">
                  {`${returnDays}-day return or exchange policy for eligible items. Items must be unworn, unwashed and in original condition with tags attached.`}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Details */}
          <div className="self-start flex flex-col gap-8">
            {/* Details */}
            <div>
              {!concierge && discountPct && (
                <div className="inline-block bg-sale text-white text-[11px] font-bold px-2 py-1 rounded-[3px] mb-4">
                  -{discountPct}%
                </div>
              )}
              <div className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2">{product.brand}</div>
              <h1 className="font-display font-bold text-[28px] tracking-wide leading-tight text-ink">
                {product.name.split(" - ")[0].trim()}
              </h1>
              {product.name.includes(" - ") && (
                <h2 className="font-display font-bold text-[28px] tracking-wide leading-tight text-ink">
                  {product.name.split(" - ")[1].trim()}
                </h2>
              )}
              {product.colors[0]?.name && (
                <div className="text-[13px] text-muted-foreground mt-1">{selectedColor}</div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-ink gap-0.5">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} viewBox="0 0 20 20" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                      <polygon points="10,1 12.6,7.5 19.5,7.5 14,11.9 16,18.5 10,14.5 4,18.5 6,11.9 0.5,7.5 7.4,7.5"/>
                    </svg>
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-ink">{rating}</span>
                <span className="text-[12px] text-muted-foreground">({reviews} reviews)</span>
              </div>

              {por ? (
                <div className="mt-4 rounded-[4px] bg-muted/60 border border-border px-4 py-3 max-w-md">
                  <div className="text-[13px] font-bold uppercase tracking-widest text-ink">Price on Request</div>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                    This item is available on request. Contact our concierge team for pricing and availability.
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-baseline gap-3">
                  <div className={`text-[26px] font-bold ${discountPct ? "text-sale" : "text-ink"}`}>{formatNaira(product.price)}</div>
                  {!concierge && originalPrice && (
                    <div className="text-base text-muted-foreground line-through">{formatNaira(originalPrice)}</div>
                  )}
                </div>
              )}



              {concierge && (
                <p className="text-[13px] text-foreground/80 mt-3 leading-relaxed">
                  The {product.name} combines iconic design with refined craftsmanship. Sourced by our concierge team from official suppliers worldwide.
                </p>
              )}

              {/* Size / Color */}
              <div className="mt-6">
                {concierge ? (
                  <div className="text-[12px] font-semibold mb-2">Color: {selectedColor}</div>
                ) : (
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[12px] font-semibold uppercase tracking-wide">SIZE</div>
                    <button onClick={() => setGuideModalOpen(true)} className="text-[11px] text-muted-foreground underline underline-offset-2">Size Guide</button>
                  </div>
                )}
                {!concierge && product.sizes.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const available = sizeAvail[s];
                      const active = selectedSize === s;
                      return (
                        <button
                          key={s}
                          disabled={!available}
                          onClick={() => setSelectedSize(s)}
                          className={`w-16 h-9 px-1.5 rounded-[3px] border text-[10px] font-semibold truncate ${
                            !available
                              ? "bg-muted/40 border-border text-muted-foreground line-through cursor-not-allowed"
                              : active
                              ? "bg-ink text-white border-ink"
                              : "bg-background border-border hover:border-ink/40"
                          }`}
                        >
                          {getProductSizeLabel(product, s, product.sizeLabels)}
                        </button>
                      );
                    })}
                  </div>
                )}
                {!concierge && product.modelFit && (
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{product.modelFit}</p>
                )}
                {!concierge && (
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {guide?.note || (product.category === "footwear" ? "Measure your foot from heel to toe and match to the closest length." : product.category === "clothing" ? "Measurements in inches. For best fit, compare with a garment you already own." : "One size fits most.")}
                  </p>
                )}
                {concierge && product.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`h-12 w-12 rounded-[3px] border-2 ${selectedColor === c.name ? "border-ink" : "border-border"} bg-[#f2f2f2] grid place-items-center overflow-hidden`}
                      >
                        <img src={product.image} alt={c.name} className="h-full w-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!concierge && product.colors.length > 0 && (
                <div className="mt-6">
                  <div className="text-[12px] font-semibold mb-2">
                    Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={c.name}
                        title={c.name}
                        className={`h-9 w-9 rounded-full border transition-all ${
                          selectedColor === c.name ? "ring-1 ring-offset-2 ring-ink border-ink" : "border-border hover:border-ink/40"
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


              {!concierge && (
                oos ? (
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] text-sale font-medium">
                    <Info className="h-4 w-4" /> Currently sold out
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] text-ink font-medium">
                    <CheckCircle2 className="h-4 w-4" /> In stock and ready to ship
                  </div>
                )
              )}


              {drop ? (
                <DropReserveBlock drop={drop} product={product} size={selectedSize} color={selectedColor} />
              ) : concierge ? (
                <>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-[12px] font-semibold text-ink">Quantity</span>
                    <div className="flex items-center border border-border rounded-[3px] overflow-hidden">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center hover:bg-muted">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-10 w-12 grid place-items-center text-[13px] font-semibold border-x border-border">{qty}</div>
                      <button onClick={() => setQty(qty + 1)} className="h-10 w-10 grid place-items-center hover:bg-muted">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <motion.button
                      whileTap="tap"
                      variants={buttonTap}
                      onClick={() => { toast("Added to your request"); navigate({ to: "/start-request" }); }}
                      className="flex-1 h-11 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="h-4 w-4" /> Add to Request
                    </motion.button>
                    <motion.button
                      whileTap="tap"
                      variants={buttonTap}
                      onClick={() => toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined })}
                      className="h-11 w-11 border border-border rounded-[3px] grid place-items-center"
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
                      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-ink bg-background text-[12px] font-bold uppercase tracking-widest text-ink"
                    >
                      <MessageCircle className="h-4 w-4" /> Chat with Concierge
                    </motion.button>
                  )}
                  <div className="mt-4 flex items-start gap-3 border border-border rounded-lg p-3.5 bg-muted/40">
                    <Info className="h-5 w-5 shrink-0 mt-0.5 text-ink" strokeWidth={1.75} />
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-ink">This is a concierge / pre-order item</div>
                      <div className="text-[11px] text-muted-foreground">We will source and deliver this item for you.</div>
                    </div>
                    <button
                      onClick={() => navigate({ to: "/how-it-works" })}
                      className="text-[12px] font-semibold text-ink flex items-center gap-1 hover:underline"
                    >
                      How It Works <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : oos ? (
                <div className="mt-5 space-y-2.5">
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
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined })} className="w-full h-12 bg-background border border-border text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2">
                    <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : ""}`} /> Save to Wishlist
                  </motion.button>
                </div>
              ) : (
                <div className="mt-5 space-y-2.5">
                  <motion.button whileTap="tap" variants={buttonTap} onClick={handleAddToCart} className="w-full h-12 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </motion.button>

                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => { handleAddToCart(); navigate({ to: "/checkout/information" }); }} className="w-full h-12 bg-background border border-ink text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px]">
                    Buy Now
                  </motion.button>
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => toggleWish(product.id, { size: selectedSize || undefined, color: selectedColor || undefined })} className="w-full h-12 bg-background border border-border text-ink text-[12px] font-bold uppercase tracking-widest rounded-[3px] flex items-center justify-center gap-2 relative">
                    <Heart className={`h-4 w-4 ${wish ? "fill-sale text-sale" : ""}`} /> Add to Wishlist
                    <span className="absolute right-4 text-[11px] text-muted-foreground font-medium normal-case tracking-normal">({(reviews * 13 / 1000).toFixed(1)}K)</span>
                  </motion.button>
                </div>
              )}

              {/* Trust badges row */}
              {!concierge && (
                <div className="mt-6 grid grid-cols-3 border border-border rounded-lg divide-x divide-border overflow-hidden">
                  {[
                    { icon: StrokeRosetteCheckIcon, title: "100% Authentic", sub: "Authenticity Guaranteed" },
                    { icon: Truck, title: "Free Shipping", sub: `On orders over ₦${freeFromLabel}` },
                    { icon: RefreshCcw, title: "7-Day Returns", sub: "Easy returns & exchanges" },
                  ].map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex flex-col items-center text-center px-3 py-4">
                      <Icon className="h-5 w-5 mb-2" strokeWidth={1.5} />
                      <div className="text-[11px] font-bold text-ink">{title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Policy cards - shown on all product pages including drops */}
            {(
              <div className="space-y-3">
                {[
                  { icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", desc: "All items are sourced from trusted suppliers. 100% authentic or your money back. Every item is verified by our experts for authenticity." },
                  { icon: Truck, title: "SHIPPING", desc: `Free shipping on orders over ₦${freeFromLabel}. Next-day delivery available. Orders are typically processed within 1 - 2 working days. Delivery times may vary depending on your location and the delivery option selected at checkout. Nationwide delivery available.` },
                  { icon: RefreshCcw, title: "EASY RETURNS", desc: "Eligible items may be returned or exchanged within 7 days of delivery. Items must be unworn, unwashed, unused and returned in their original condition and packaging." },
                  { icon: Lock, title: "SECURE PAYMENTS", desc: "Shop with confidence. Your payment information is securely protected, with multiple trusted payment options available for a safe and seamless checkout." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="border border-border rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 border border-border rounded-[4px] grid place-items-center">
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold tracking-widest text-ink">{title}</div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed mt-1">{desc}</div>
                        <button className="text-[11px] text-ink underline mt-1.5">Learn more</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* Related */}
        <div className="mt-12">
          <div className="text-[11px] font-bold tracking-widest text-ink mb-4">YOU MAY ALSO LIKE</div>
          <div className="grid grid-cols-4 gap-4">
            {related.map((p) => (
              <div key={p.id} onClick={() => navigate({ to: "/product/$id", params: { id: p.id } })}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Size Guide popup */}
        {guideModalOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-6"
            onClick={() => setGuideModalOpen(false)}
          >
            <div
              className="bg-background rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background flex items-center justify-between px-5 py-4 border-b border-border rounded-t-xl">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Size Guide</div>
                  <div className="text-[14px] font-bold text-ink">
                    {product.category === "footwear" ? "Footwear Sizing" : product.category === "clothing" ? "Apparel Sizing" : "Sizing"}
                  </div>
                </div>
                <button
                  onClick={() => setGuideModalOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-full bg-muted"
                  aria-label="Close size guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-4">
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
                            {r.map((v, i) => <td key={i} className="py-2 font-medium">{v}</td>)}
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
                            {r.map((v, i) => <td key={i} className="py-2 font-medium">{v}</td>)}
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
            </div>
          </div>
        )}
      </div>
      </DesktopShell>
  );
}
