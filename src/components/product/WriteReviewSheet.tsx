import { useState } from "react";
import { X, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useUserReviews } from "@/lib/reviews";

export function WriteReviewSheet({
  productId,
  open,
  onClose,
  verified = false,
}: {
  productId: string;
  open: boolean;
  onClose: () => void;
  verified?: boolean;
}) {
  const submitReview = useUserReviews((s) => s.submit);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [fit, setFit] = useState<"Runs small" | "True to size" | "Runs large">("True to size");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !author.trim()) {
      return toast.error("Please fill in your name, title and review");
    }
    setBusy(true);
    const res = await submitReview({
      productId,
      author: author.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
      fit,
      verified,
    });
    setBusy(false);
    if (res.ok) toast.success(res.message || "Thanks! Your review will appear once approved.");
    else toast.error(res.message || "Could not submit review");
    setTitle(""); setBody(""); setAuthor(""); setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-background rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-background border-b border-border flex items-center justify-between px-5 py-3.5">
          <div className="font-display font-bold text-[15px]">Write a review</div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {verified && (
            <div className="inline-flex items-center gap-1 text-[11px] text-white bg-ink border border-ink rounded-full px-2 py-1">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Verified buyer
            </div>
          )}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Your rating</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="p-1"
                  aria-label={`${i} stars`}
                >
                  <Star
                    className="h-7 w-7 text-ink"
                    fill={(hover || rating) >= i ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Your name</div>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Ada N."
              className="w-full h-11 px-3 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </label>
          <label className="block">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Review title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum it up in one line"
              className="w-full h-11 px-3 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </label>
          <label className="block">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Your review</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Share fit, quality, and what you loved"
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </label>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-2">How did it fit?</div>
            <div className="grid grid-cols-3 gap-2">
              {(["Runs small", "True to size", "Runs large"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFit(f)}
                  className={`h-10 rounded-md border text-[12px] font-semibold ${fit === f ? "bg-ink text-white border-ink" : "bg-white border-border"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={busy} className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[14px] hover:bg-ink/90 disabled:opacity-60">
            {busy ? "Submitting…" : "Publish review"}
          </button>
        </form>
      </div>
    </div>
  );
}
