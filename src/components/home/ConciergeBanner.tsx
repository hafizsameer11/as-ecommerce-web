import { PromoBanner } from "./PromoBanner";
import { conciergeImage } from "@/lib/mock-data";

export function ConciergeBanner() {
  return (
    <PromoBanner
      tag="Concierge"
      title={"FASHION\nCONCIERGE"}
      ctaLabel="Start Request"
      ctaTo="/start-request"
      secondaryCtaLabel="How It Works"
      secondaryCtaTo="/how-it-works"
      image={conciergeImage}
    />
  );
}
