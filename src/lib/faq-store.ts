import { create } from "zustand";
import { HelpCircle } from "lucide-react";
import { cmsApi } from "@/lib/api/cms";
import { faqCategories, faqItems as seedItems, type FaqItem } from "@/components/faq/faqData";

type State = {
  items: FaqItem[];
  categories: typeof faqCategories;
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

function mapCategorySlug(slug?: string) {
  const s = (slug || "").toLowerCase();
  if (s.includes("ship") || s.includes("deliver")) return "shipping";
  if (s.includes("return") || s.includes("refund")) return "returns";
  if (s.includes("pay")) return "payment";
  if (s.includes("order") || s.includes("concierge") || s.includes("request")) return "request";
  return "other";
}

export const useStoreFaqs = create<State>()((set) => ({
  items: seedItems,
  categories: faqCategories,
  hydrated: false,
  hydrate: async () => {
    try {
      const [cats, items] = await Promise.all([
        cmsApi.faqCategories().catch(() => []),
        cmsApi.faqs(),
      ]);
      if (!items?.length) {
        set({ hydrated: true });
        return;
      }
      const catById = new Map(
        (cats as { id: string; slug?: string }[]).map((c) => [c.id, c.slug || c.id])
      );
      set({
        items: items.map((it) => ({
          q: it.question,
          a: it.answer,
          category: mapCategorySlug(catById.get(it.categoryId || "") || it.categoryId),
          Icon: HelpCircle,
        })),
        hydrated: true,
      });
    } catch (err) {
      console.warn("[faqs] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));
