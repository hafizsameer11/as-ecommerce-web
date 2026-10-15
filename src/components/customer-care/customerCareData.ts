import { Truck, RotateCcw, Wallet, Compass, HelpCircle, User, PackageSearch, Shield, FileText, Cookie, Sparkles, Info, type LucideIcon } from "lucide-react";

export type CareNavItem = { id: string; label: string; to: string; Icon: LucideIcon };

export const careNav: CareNavItem[] = [
  { id: "about-us", label: "About Us", to: "/customer-care/about-us", Icon: Info },
  { id: "shipping-policy", label: "Shipping Policy", to: "/customer-care/shipping-policy", Icon: Truck },
  { id: "return-policy", label: "Return Policy", to: "/customer-care/return-policy", Icon: RotateCcw },
  { id: "refund-policy", label: "Refund Policy", to: "/customer-care/refund-policy", Icon: Wallet },
  { id: "privacy-policy", label: "Privacy Policy", to: "/customer-care/privacy-policy", Icon: Shield },
  { id: "terms-of-service", label: "Terms of Service", to: "/customer-care/terms-of-service", Icon: FileText },
  { id: "cookie-policy", label: "Cookie Policy", to: "/customer-care/cookie-policy", Icon: Cookie },
  { id: "our-commitment", label: "Our Commitment", to: "/customer-care/our-commitment", Icon: Sparkles },
  { id: "how-it-works", label: "How It Works", to: "/customer-care/how-it-works", Icon: Compass },
  { id: "faqs", label: "FAQs", to: "/customer-care/faqs", Icon: HelpCircle },
  { id: "contact-us", label: "Contact Us", to: "/customer-care/contact-us", Icon: User },
  { id: "track-order", label: "Track Your Order", to: "/customer-care/track-order", Icon: PackageSearch },
];
