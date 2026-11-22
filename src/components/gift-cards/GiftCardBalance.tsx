import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { commerceApi } from "@/lib/api/commerce";
import { koboToNaira } from "@/lib/api/client";

function formatNaira(kobo: number) {
  return `₦${koboToNaira(kobo).toLocaleString("en-NG")}`;
}

export function GiftCardBalance({ className = "" }: { className?: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; balance: number; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setError("Enter your gift card code.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
  setResult(null);
    try {
      const g = await commerceApi.giftCardBalance(trimmed);
      setResult(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not look up that card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <Gift className="h-4 w-4 text-gold" aria-hidden />
        Check gift card balance
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") void check();
          }}
          placeholder="GC-1234-5678"
          className="min-w-0 flex-1 h-10 rounded bg-muted px-3 text-[13px] font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-ink"
          aria-label="Gift card code"
        />
        <button
          type="button"
          onClick={() => void check()}
          disabled={loading}
          className="h-10 px-4 rounded bg-ink text-white text-[12px] font-semibold hover:opacity-90 disabled:opacity-60 shrink-0 inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Check balance
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
      {result && (
        <p className="mt-3 text-[13px]">
          <span className="font-mono font-semibold">{result.code}</span>
          {" · "}
          <span className="font-semibold">{formatNaira(result.balance)}</span> available
          <span className="block text-[11px] text-muted-foreground mt-1">
            Valid until {new Date(result.expiresAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}. Use at checkout or in any ASL ORIGINALS store.
          </span>
        </p>
      )}
    </div>
  );
}