import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function buildPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  const go = (p: number) => {
    const next = Math.min(totalPages, Math.max(1, p));
    if (next !== page) {
      onChange(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="h-9 w-9 flex items-center justify-center border border-border rounded-[3px] disabled:opacity-35 hover:border-ink/40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="h-9 w-6 flex items-center justify-center text-[12px] text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={`h-9 min-w-9 px-2 text-[12px] font-semibold rounded-[3px] border ${
              p === page
                ? "bg-ink text-white border-ink"
                : "border-border hover:border-ink/40"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="h-9 w-9 flex items-center justify-center border border-border rounded-[3px] disabled:opacity-35 hover:border-ink/40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
