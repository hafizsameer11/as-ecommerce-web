import {
  Package,
  CheckCircle2,
  Ban,
  Clock,
  CreditCard,
  FileText,
  Search,
  Box,
  Truck,
  ClipboardCheck,
  RefreshCw,
  Users,
  ShieldCheck,
  AlertTriangle,
  Repeat,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export type InfoItem = { Icon: LucideIcon; title: string; body: string };

export const policyItems: InfoItem[] = [
  { Icon: Package, title: "Return Window", body: "You can request a return within 3 - 7 days from the date your item is delivered." },
  { Icon: CheckCircle2, title: "Item Condition", body: "Items must be unused, unwashed, and in their original condition with all tags, packaging, and accessories." },
  { Icon: Ban, title: "Non-Returnable Items", body: "Certain items are non-returnable including underwear, swimwear, fragrances, and personal-care items." },
  { Icon: Clock, title: "Refund Time", body: "Refunds are processed within 5 - 10 working days after we receive and inspect your return." },
  { Icon: CreditCard, title: "Refund Method", body: "Refunds are issued to the original payment method used for the order." },
];

export const howItWorksSteps: InfoItem[] = [
  { Icon: FileText, title: "Start a Return Request", body: "Head to your order and click 'Start a Return Request'. Fill in the details and reason for return." },
  { Icon: Search, title: "Get Return Confirmation", body: "Our team will review your request and send you return instructions." },
  { Icon: Box, title: "Pack Your Item", body: "Pack the item securely with all original packaging, tags, and accessories." },
  { Icon: Truck, title: "Ship the Item Back", body: "Use the provided return instructions to send your item back to us." },
  { Icon: ClipboardCheck, title: "We Inspect Your Item", body: "Once we receive your item, we will inspect it to ensure it meets the return conditions." },
  { Icon: RefreshCw, title: "Refund Processed", body: "Your refund will be processed within 5 - 10 working days after approval." },
];

export const moreDetailsItems: InfoItem[] = [
  { Icon: Users, title: "Return Eligibility", body: "Returns are available for all eligible orders placed on ASL ORIGINALS." },
  { Icon: ShieldCheck, title: "Return Shipping", body: "Customers are responsible for return shipping costs unless the return is due to our error or a defective item." },
  { Icon: AlertTriangle, title: "Damaged or Wrong Items", body: "If you receive a wrong or defective item, contact us within 48 hours of delivery with photos for assistance." },
  { Icon: Repeat, title: "Exchanges", body: "We only offer exchanges for defective or incorrect items. If eligible, we will replace the item." },
  { Icon: HelpCircle, title: "Questions?", body: "If you have any questions about returns and refunds, please contact our support team." },
];
