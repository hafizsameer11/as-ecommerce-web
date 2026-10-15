import { loyaltyApi, nairaToKobo } from "@/lib/api/loyalty";

export type ConciergeFormFields = {
  name: string;
  category: string;
  size: string;
  colour: string;
  condition: string;
  link: string;
  desc: string;
  budget: string;
  source: string;
  notes: string;
};

function parseBudgetNaira(raw: string): number | undefined {
  const digits = raw.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export async function submitConciergeRequest(
  form: ConciergeFormFields,
  files?: File[],
  extra?: { productId?: string }
) {
  const budgetNaira = parseBudgetNaira(form.budget);
  return loyaltyApi.createConciergeRequest(
    {
      source: extra?.productId ? "product" : "form",
      productId: extra?.productId,
      itemName: form.name.trim(),
      category: form.category,
      size: form.size || undefined,
      color: form.colour || undefined,
      condition: form.condition || undefined,
      reference: form.link || undefined,
      description: form.desc || undefined,
      budget: budgetNaira != null ? nairaToKobo(budgetNaira) : undefined,
      preferredSource: form.source || undefined,
      notes: form.notes || undefined,
    },
    files
  );
}
