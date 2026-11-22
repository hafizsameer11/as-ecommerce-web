import type { ReactNode } from "react";
import { useStorePage } from "@/lib/cms-page";
import { StorePageBlocks } from "@/components/customer-care/StorePageBlocks";

/**
 * Renders CMS blocks for `slug` when the page exists and has content;
 * otherwise (loading, 404, empty, error) renders the static `children` fallback.
 */
export function CmsOrStatic({
  slug,
  children,
  showTitle = false,
}: {
  slug: string;
  children: ReactNode;
  showTitle?: boolean;
}) {
  const { page, hasContent } = useStorePage(slug);
  if (!hasContent || !page) return <>{children}</>;
  return (
    <div className="space-y-6">
      {showTitle && page.title ? (
        <header className="space-y-1">
          <h1 className="font-display text-[28px] md:text-[36px] leading-tight">{page.title}</h1>
          {page.subtitle ? <p className="text-[14px] text-foreground/70">{page.subtitle}</p> : null}
        </header>
      ) : null}
      <StorePageBlocks blocks={page.blocks} />
    </div>
  );
}
