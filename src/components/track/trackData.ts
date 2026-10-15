import { FileText, Search, Globe, Tag, Receipt, CreditCard, Package, PackageCheck, Truck, CheckCircle2, Lock, Globe2, Headphones, MessageCircle, Mail, HelpCircle } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";

export const trackSteps = [
  { id: "received", label: "REQUEST RECEIVED", sub: "We have received your request.", Icon: FileText, short: "Received", date: "May 20" },
  { id: "reviewing", label: "REVIEWING REQUEST", sub: "Our team is reviewing your request.", Icon: Search, short: "Reviewing", date: "May 20" },
  { id: "sourcing", label: "SOURCING", sub: "We are sourcing your desired item.", Icon: Globe, short: "Sourcing", date: "May 21" },
  { id: "located", label: "LOCATED", sub: "We have located your item.", Icon: Tag, short: "Located", date: "May 22" },
  { id: "price", label: "PRICE SENT", sub: "Price and details have been sent to you.", Icon: Receipt, short: "Price Sent", date: "May 22" },
  { id: "awaiting", label: "AWAITING PAYMENT", sub: "Waiting for payment confirmation.", Icon: CreditCard, short: "Awaiting", date: "May 23" },
  { id: "confirmed", label: "ORDER CONFIRMED", sub: "Your order has been confirmed.", Icon: Package, short: "Confirmed", date: "May 23" },
  { id: "preparing", label: "PREPARING SHIPMENT", sub: "We are preparing your item for shipment.", Icon: PackageCheck, short: "Preparing", date: "May 24" },
  { id: "transit", label: "IN TRANSIT", sub: "Your order is on the way to you.", Icon: Truck, short: "In Transit", date: "May 25" },
  { id: "delivered", label: "DELIVERED", sub: "Your order has been delivered.", Icon: CheckCircle2, short: "Delivered", date: "Est. May 28 - 29" },
];

export const currentStepIndex = 8; // In Transit

export const trackTrust = [
  { Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", sub: "We source 100% authentic items from trusted partners." },
  { Icon: Lock, title: "SECURE PAYMENT", sub: "Your payment is safe with us. Multiple secure options." },
  { Icon: Globe2, title: "WORLDWIDE SOURCING", sub: "Access exclusive and sold-out items worldwide." },
  { Icon: Headphones, title: "DEDICATED SUPPORT", sub: "Our team is here to assist you every step of the way." },
];

export const helpOptions = [
  { Icon: MessageCircle, title: "Chat with Concierge", sub: "We're here to help you." },
  { Icon: MessageCircle, title: "WhatsApp Support", sub: "Message us on WhatsApp." },
  { Icon: Mail, title: "Email Support", sub: "customerservice@asloriginals.com" },
  { Icon: HelpCircle, title: "FAQ", sub: "View frequently asked questions." },
];

export const mockRequest = {
  id: "ASL123456",
  date: "May 20, 2024",
  item: 'Nike Air Jordan 1 Retro High OG "Black Toe Reimagined"',
  size: "UK 9 / US 10",
  color: "Black / Red / White",
  status: "IN TRANSIT",
  tracking: "1234567890",
  courier: "DHL Express",
  estimated: "May 28 - May 29",
};

export function statusToStepIndex(status: string): number {
  switch (status.toLowerCase()) {
    case "sourcing": return 2;
    case "order confirmed": return 6;
    case "in transit": return 8;
    case "completed": return 9;
    case "cancelled": return 0;
    default: return 8;
  }
}
