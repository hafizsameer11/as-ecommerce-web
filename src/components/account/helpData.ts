import {
  Headphones,
  Mail,
  Phone,
  Clock,
  Calendar,
  Timer,
  Shield,
} from "lucide-react";
import type { ComponentType } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export type SupportChannel = {
  id: string;
  title: string;
  desc: string;
  cta: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
  footnote?: string;
};

export const supportChannels: SupportChannel[] = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    desc: "Chat with our support team instantly.",
    cta: "Chat Now",
    Icon: WhatsAppIcon,
    color: "text-[#25D366]",
    bg: "bg-[#25D366]/10",
  },
  {
    id: "email",
    title: "Email Support",
    desc: "Send us an email and we'll get back to you.",
    cta: "Send Email",
    Icon: Mail,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "phone",
    title: "Phone Support",
    desc: "Speak with our team directly.",
    cta: "View Number",
    Icon: Phone,
    color: "text-rose-600",
    bg: "bg-rose-50",
    footnote: "Mon - Sun, 9AM - 8PM",
  },
];

export const faqItems = [
  { id: "1", question: "How do I start a return or refund?" },
  { id: "2", question: "How long does refund take?" },
  { id: "3", question: "How can I track my order or request?" },
  { id: "4", question: "Do you offer size or product recommendations?" },
  { id: "5", question: "What payment methods do you accept?" },
];

export const supportHours = [
  { id: "weekdays", label: "Monday - Saturday", value: "9:00 AM - 8:00 PM (WAT)", Icon: Calendar },
  { id: "sunday", label: "Sunday", value: "9:00 AM - 8:00 PM (WAT)", Icon: Clock },
  { id: "response", label: "Response Time", value: "Usually within 24 hours", Icon: Timer },
];

export const heroBanner = {
  Icon: Headphones,
  title: "How can we help you today?",
  desc: "Our support team is ready to assist you.",
  cta: "Contact Support",
};

export const satisfactionBanner = {
  Icon: Shield,
  title: "Your satisfaction is our priority",
  desc: "We're committed to providing you with the best support experience.",
  cta: "Contact Support",
};
