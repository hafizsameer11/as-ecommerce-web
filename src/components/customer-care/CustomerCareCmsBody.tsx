import { useStorePage } from "@/lib/cms-page";
import { StorePageBlocks, ContentUnavailable } from "@/components/customer-care/StorePageBlocks";

export function CustomerCareCmsBody({ slug }: { slug: string }) {
  const { page, loading, hasContent } = useStorePage(slug);
  if (loading) {
    return <p className="text-[13px] text-muted-foreground py-4">Loading…</p>;
  }
  if (!hasContent || !page) return <ContentUnavailable />;
  return <StorePageBlocks blocks={page.blocks} />;
}
