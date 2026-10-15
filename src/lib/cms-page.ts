import { useEffect, useState } from "react";
import { cmsApi } from "@/lib/api/cms";

export type StorePageBlock = {
  id: string;
  type: string;
  title?: string;
  body?: string;
  eyebrow?: string;
  items?: Array<{ title?: string; body?: string; value?: string }>;
  [key: string]: unknown;
};

export type StorePage = {
  title: string;
  subtitle?: string | null;
  blocks: StorePageBlock[];
};

export function useStorePage(slug: string) {
  const [page, setPage] = useState<StorePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cmsApi
      .pageBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setPage(data as StorePage);
      })
      .catch(() => {
        if (!cancelled) setPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hasContent = Boolean(page?.blocks?.length);
  return { page, loading, hasContent };
}
