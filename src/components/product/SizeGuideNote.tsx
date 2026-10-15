import { useSizeGuideFor } from "@/lib/size-guide-store";

export function SizeGuideNote({ brand, category, className = "" }: { brand: string; category: string; className?: string }) {
  const guide = useSizeGuideFor(brand, category);
  if (!guide?.note) return null;
  return (
    <div className={`text-[12px] leading-snug text-ink ${className}`}>
      <div className="uppercase underline underline-offset-2 tracking-wide text-[11px] font-medium">Size Guide</div>
      <p className="mt-0.5 text-foreground/80">{guide.note}</p>
    </div>
  );
}
