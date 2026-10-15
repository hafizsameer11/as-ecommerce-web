import { useState } from "react";
import { ThumbsUp, ShieldCheck } from "lucide-react";
import { useProductReviews } from "@/lib/reviews";
import { useOrders } from "@/lib/orders-store";
import { WriteReviewSheet } from "./WriteReviewSheet";

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div className="flex text-ink gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < Math.round(n) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ height: size, width: size }}
        >
          <polygon points="10,1 12.6,7.5 19.5,7.5 14,11.9 16,18.5 10,14.5 4,18.5 6,11.9 0.5,7.5 7.4,7.5" />
        </svg>
      ))}
    </div>
  );
}

export function ProductReviews({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const { reviews, average: rating, count: total, breakdown, markHelpful } = useProductReviews(productId);
  const [shown, setShown] = useState(compact ? 2 : 3);
  const [open, setOpen] = useState(false);
  const visible = reviews.slice(0, shown);

  // "Verified buyer" if any order in history contains this product's name.
  const hasPurchased = useOrders((s) =>
    s.orders.some((o) => o.items.some((i) => i.name.toLowerCase().includes(productId.replace(/-/g, " ").toLowerCase())))
  );

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* Summary */}
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-[220px_1fr]"} gap-6 items-center`}>
        <div className={compact ? "flex items-center gap-4" : "text-center"}>
          <div>
            <div className="text-4xl font-display font-bold text-ink leading-none">{rating.toFixed(1)}</div>
            <div className="mt-1"><Stars n={rating} /></div>
            <div className="text-[11px] text-muted-foreground mt-1">Based on {total} reviews</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="w-6 text-ink font-medium">{b.star}★</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-ink" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review button */}
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold uppercase tracking-widest text-ink">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] font-semibold underline text-ink"
        >
          Write a review
        </button>
      </div>

      <WriteReviewSheet productId={productId} open={open} onClose={() => setOpen(false)} verified={hasPurchased} />



      {/* Reviews */}
      <div className="divide-y divide-border">
        {visible.map((r) => (
          <div key={r.id} className="py-4 first:pt-0">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-[11px] font-bold text-ink shrink-0">
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink">{r.author}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white bg-ink border border-ink rounded-full px-1.5 py-0.5">
                      <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Verified buyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars n={r.rating} size={12} />
                  <span className="text-[11px] text-muted-foreground">{r.date}</span>
                </div>
                <div className="text-[13px] font-semibold text-ink mt-2">{r.title}</div>
                <p className="text-[13px] text-foreground/85 mt-1 leading-relaxed">{r.body}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  {r.fit && <span>Fit: <span className="text-ink font-medium">{r.fit}</span></span>}
                  <button
                    type="button"
                    onClick={() => markHelpful(r.id)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    <ThumbsUp className="h-3 w-3" /> Helpful ({r.helpful})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {shown < reviews.length && (
        <button
          onClick={() => setShown(reviews.length)}
          className="w-full h-11 border border-border rounded-[3px] text-[12px] font-bold uppercase tracking-widest text-ink"
        >
          Show all reviews
        </button>
      )}
    </div>
  );
}
