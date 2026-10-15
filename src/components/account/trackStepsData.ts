import { FileText, Globe, Tag, CreditCard, Package, Truck, Gift, LucideIcon } from "lucide-react";

export type TrackStep = {
  id: string;
  label: string;
  date?: string;
  Icon: LucideIcon;
};

export const accountTrackSteps: TrackStep[] = [
  { id: "received", label: "Request Received", date: "May 20, 2024", Icon: FileText },
  { id: "sourcing", label: "Sourcing", date: "May 25, 2024", Icon: Globe },
  { id: "located", label: "Item Located", Icon: Tag },
  { id: "payment", label: "Payment Pending", Icon: CreditCard },
  { id: "confirmed", label: "Order Confirmed", Icon: Package },
  { id: "transit", label: "In Transit", Icon: Truck },
  { id: "delivered", label: "Delivered", Icon: Gift },
];

// index of current step (0-based); everything <= is highlighted, current is gold-filled
export const accountCurrentStep = 1; // Sourcing

export const trackedRequest = {
  id: "ASL123456",
  brand: "Jordan",
  name: "Air Jordan 1 Retro High OG",
  detail: "Black Toe Reimagined",
  size: "UK 9",
  colour: "Black/White/Red",
  status: "Sourcing" as const,
  requestedOn: "May 20, 2024",
  lastUpdate: "May 25, 2024",
  updateMessage: "We're sourcing your item from our network.",
  image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80",
};
