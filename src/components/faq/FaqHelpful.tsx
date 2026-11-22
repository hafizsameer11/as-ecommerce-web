import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cmsApi } from "@/lib/api/cms";

const VOTED_KEY = "asl-faq-votes";

function readVotes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VOTED_KEY) || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeVote(id: string, helpful: boolean) {
  try {
    window.localStorage.setItem(VOTED_KEY, JSON.stringify({ ...readVotes(), [id]: helpful }));
  } catch {
    /* storage unavailable */
  }
}

/** "Was this helpful?" row — posts to /store/content/faqs/:id/feedback. Hidden for static fallback FAQs (no id). */
export function FaqHelpful({ id, compact = false }: { id?: string; compact?: boolean }) {
  const [voted, setVoted] = useState<boolean | null>(() => (id ? (readVotes()[id] ?? null) : null));
  const [busy, setBusy] = useState(false);

  if (!id) return null;

  const vote = async (helpful: boolean) => {
    if (busy || voted !== null) return;
    setBusy(true);
    try {
      await cmsApi.faqFeedback(id, helpful);
      writeVote(id, helpful);
      setVoted(helpful);
      toast.success(helpful ? "Glad that helped!" : "Thanks — we'll improve this answer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send feedback");
    } finally {
      setBusy(false);
    }
  };

  const text = compact ? "text-[10.5px]" : "text-[11.5px]";
  const btn = (active: boolean) =>
    `inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium transition disabled:opacity-60 ${
      active ? "border-ink bg-ink text-white" : "border-border text-ink/70 hover:border-ink hover:text-ink"
    }`;

  return (
    <div className={`mt-3 flex items-center gap-2 ${text} text-muted-foreground`}>
      {voted === null ? (
        <>
          <span>Was this helpful?</span>
          <button type="button" disabled={busy} onClick={() => void vote(true)} className={btn(false)}>
            <ThumbsUp className="h-3 w-3" /> Yes
          </button>
          <button type="button" disabled={busy} onClick={() => void vote(false)} className={btn(false)}>
            <ThumbsDown className="h-3 w-3" /> No
          </button>
        </>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          {voted ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
          Thanks for your feedback
        </span>
      )}
    </div>
  );
}
