import { Compass, Headset, Gift, Truck, Gem } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";

export type Benefit = {
  id: string;
  title: string;
  desc: string;
  Icon: ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;
};

export const benefits: Benefit[] = [
  { id: "priority", title: "Priority Access", desc: "Get early access to limited releases and exclusive items.", Icon: Compass },
  { id: "concierge", title: "Dedicated Concierge", desc: "Enjoy personal support from your dedicated concierge team.", Icon: Headset },
  { id: "offers", title: "Special Offers", desc: "Receive exclusive member-only offers and promotions.", Icon: Gift },
  { id: "shipping", title: "Free Priority Shipping", desc: "Enjoy free and faster shipping on all eligible orders.", Icon: Truck },
  { id: "authenticity", title: "Authenticity Guarantee", desc: "100% authentic products and secure sourcing.", Icon: StrokeRosetteCheckIcon },
];

export const moreBenefits = {
  title: "More benefits, more rewards.",
  desc: "We're always adding more value to make your experience even better.",
  Icon: Gem,
};
