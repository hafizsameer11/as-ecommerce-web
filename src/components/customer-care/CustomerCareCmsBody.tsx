import { useStorePage } from "@/lib/cms-page";
import { StorePageBlocks, ContentUnavailable } from "@/components/customer-care/StorePageBlocks";
import { usePublicSettings } from "@/lib/api/settings";
import { CUSTOMER_CARE_LEGAL_SLUG, legalPolicyText } from "@/lib/public-settings-format";

function SettingsLegalBody({ text }: { text: string }) {
  const looksHtml = /<[a-z][\s\S]*>/i.test(text);
  if (looksHtml) {
    return (
      <div
        className="text-[13px] text-foreground/80 leading-relaxed space-y-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return <div className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">{text}</div>;
}

export function CustomerCareCmsBody({ slug }: { slug: string }) {
  const { page, loading, hasContent } = useStorePage(slug);
  const { data: publicSettings } = usePublicSettings();
  const legalKey = CUSTOMER_CARE_LEGAL_SLUG[slug];
  const legalFallback = legalKey ? legalPolicyText(publicSettings, legalKey) : "";

  if (loading) {
    return <p className="text-[13px] text-muted-foreground py-4">Loading…</p>;
  }
  if (hasContent && page) return <StorePageBlocks blocks={page.blocks} />;
  if (legalFallback) return <SettingsLegalBody text={legalFallback} />;
  return <ContentUnavailable />;
}