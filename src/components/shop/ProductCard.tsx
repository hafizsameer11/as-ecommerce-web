import { motion } from "framer-motion";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatNaira, getProductRating, getSaleInfo, isOutOfStock, isPriceOnRequest, type Product } from "@/lib/shop-data";
import { cardHover, imageZoom, buttonTap } from "@/lib/motion";
import { useWishlist } from "@/lib/wishlist";
import { useQuickAdd } from "@/lib/quick-add-store";
import { useQuickView } from "@/lib/quick-view-store";



export function ProductCard({ product, compact = false, showRating = false, trendingBadge = false, saleMode = false, conciergeMode = false, eyebrow }: { product: Product; compact?: boolean; showRating?: boolean; trendingBadge?: boolean; saleMode?: boolean; conciergeMode?: boolean; eyebrow?: string }) {
  const { originalPrice, discountPct } = getSaleInfo(product);
  const por = isPriceOnRequest(product);
  const onSale = !por && (saleMode || !!discountPct);
  const wish = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const navigate = useNavigate();
  const openQuickAdd = useQuickAdd((s) => s.open);
  const openQuickView = useQuickView((s) => s.open);
  const { rating, reviews } = getProductRating(product.id);
  const oos = !por && isOutOfStock(product);



  const toggleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
    toast(!wish ? "Added to wishlist" : "Removed from wishlist");
  };

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickAdd(product.id);
  };

  const quickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product.id);
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={() => navigate({ to: "/product/$id", params: { id: product.id }, search: conciergeMode ? { concierge: true } : {} })}
      className={`group cursor-pointer ${compact ? "" : ""}`}
    >
      <div className={`relative overflow-hidden bg-[#f2f2f2] rounded-xl aspect-[3/4]`}>
        <motion.img
          variants={imageZoom}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-contain p-3 ${oos ? "opacity-60 grayscale" : ""}`}
        />
        {oos && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/85 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1.5">
            Sold Out
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col items-center gap-1.5">
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={toggleWish}
            aria-label="Toggle wishlist"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/95 border border-black/10 shadow-sm"
          >
            <Heart
              className={`h-[16px] w-[16px] transition-colors ${wish ? "fill-sale text-sale" : "text-ink"}`}
              strokeWidth={1.6}
            />
          </motion.button>

          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={quickView}
            aria-label="Quick view"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/95 border border-black/10 shadow-sm"
          >
            <Eye className="h-[16px] w-[16px] text-ink" strokeWidth={1.6} />
          </motion.button>

          {!oos && !por && !conciergeMode && (
            <motion.button
              whileTap="tap"
              variants={buttonTap}
              onClick={quickAdd}
              aria-label="Add to bag"
              className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-ink shadow-sm"
            >
              <ShoppingBag className="h-[16px] w-[16px] text-white" strokeWidth={1.6} />
            </motion.button>
          )}
        </div>
        {por ? (
          <div className="absolute top-2 left-2 bg-ink text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[3px]">
            On Request
          </div>
        ) : onSale && discountPct ? (
          <div className="absolute top-2 left-2 bg-sale text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]">
            -{discountPct}%
          </div>
        ) : trendingBadge ? (

          <div className="absolute top-2 left-2 bg-ink text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[3px] flex items-center gap-1">
            <span>↗</span> Trending
          </div>
        ) : product.availability === "Limited Pieces" && (
          <div className="absolute left-2 top-2 rounded-[3px] border border-ink bg-card px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-ink">
            Limited
          </div>
        )}
      </div>
      <div className={`${compact ? "mt-1.5" : "mt-3"}`}>
        {eyebrow ? (
          <div className={`text-muted-foreground leading-none ${compact ? "text-[9px] mb-1" : "text-[10px] mb-1.5"}`}>
            {eyebrow}
          </div>
        ) : null}
        <div className={`font-bold text-ink ${compact ? "text-[10px] tracking-wider leading-none" : "text-[11px] tracking-widest"}`}>
          {product.brand}
        </div>
        <div className={`font-medium text-foreground/90 leading-tight ${compact ? "mt-0.5 line-clamp-1 text-[10px]" : "mt-1 line-clamp-2 text-xs"}`}>
          {product.name}
        </div>
        {por ? (
          <div className={`font-bold uppercase tracking-wider text-ink mt-0.5 ${compact ? "text-[9px]" : "text-[11px]"}`}>
            Price on Request
          </div>
        ) : onSale && originalPrice ? (
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`font-bold text-sale ${compact ? "text-[10px]" : "text-xs"}`}>{formatNaira(product.price)}</span>
            <span className={`text-muted-foreground line-through ${compact ? "text-[9px]" : "text-[10px]"}`}>{formatNaira(originalPrice)}</span>
          </div>
        ) : (
          <div className={`font-bold text-ink mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
            {formatNaira(product.price)}
          </div>
        )}

        {showRating ? (
          <div className="flex items-center gap-1 mt-1">
            {[0, 1, 2, 3, 4].map((i) => {
              const filled = i < Math.round(rating);
              return (
                <Star
                  key={i}
                  className={`h-3 w-3 ${filled ? "fill-ink text-ink" : "text-muted-foreground"}`}
                  strokeWidth={1.5}
                />
              );
            })}
            <span className="text-[10px] text-muted-foreground ml-0.5">
              {rating} ({reviews})
            </span>
          </div>
        ) : (
          product.colors.length > 0 && !compact && !onSale && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-border ring-1 ring-inset ring-white/60"
                  style={{ background: c.hex === "linear" ? "conic-gradient(from 180deg, #000 0deg, #fff 90deg, #c44569 180deg, #2d5a3d 270deg, #000 360deg)" : c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 1 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">+{product.colors.length} colors</span>
              )}
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
