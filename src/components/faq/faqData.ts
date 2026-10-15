import { LayoutGrid, ShoppingBag, CreditCard, Truck, RotateCcw, MoreHorizontal, HelpCircle, Package, FileEdit, Clock, Tag, Search, XCircle, Layers, Globe, MapPin, ShieldCheck, PackageX, Headphones, Calendar, Lock, Globe2, Gift, KeyRound, BadgeCheck, Box, BellRing, Ruler, Percent, RefreshCw } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";

export const faqCategories = [
  { id: "all", label: "ALL QUESTIONS", short: "ALL", Icon: LayoutGrid },
  { id: "request", label: "ORDERS & CONCIERGE", short: "ORDERS", Icon: ShoppingBag },
  { id: "payment", label: "PAYMENT", short: "PAYMENT", Icon: CreditCard },
  { id: "shipping", label: "SHIPPING & DELIVERY", short: "SHIPPING", Icon: Truck },
  { id: "returns", label: "RETURNS & REFUNDS", short: "RETURNS", Icon: RotateCcw },
  { id: "other", label: "OTHER", short: "OTHER", Icon: MoreHorizontal },
];

export type FaqItem = {
  q: string;
  a: string;
  category: string;
  Icon: any;
};

const EMAIL = "customerservice@asloriginals.com";

export const faqItems: FaqItem[] = [
  // Orders & Concierge
  { q: "How do I place an order?", a: "Browse our collections, select your size and colour, and tap Add to Cart. Review your cart, then check out with your delivery details and preferred payment method. You will receive an order confirmation by email once your order is placed.", category: "request", Icon: ShoppingBag },
  { q: "What is Fashion Concierge?", a: "Fashion Concierge is our premium sourcing service - we find, authenticate and deliver luxury items from anywhere in the world, including pieces that are sold out or not in our catalogue.", category: "request", Icon: HelpCircle },
  { q: "What kinds of items can I request?", a: "You can request footwear, apparel, accessories, fragrances, watches, jewellery and other luxury lifestyle items.", category: "request", Icon: Package },
  { q: "How do I submit a concierge request?", a: "Tap Start a Request, share the product link or a photo, add your size and preferences, and our concierge team will reach out with a quotation.", category: "request", Icon: FileEdit },
  { q: "How long does it take to get a response?", a: "Our concierge team typically responds within 2 - 6 hours during business hours (Monday to Friday, 9 AM - 7 PM).", category: "request", Icon: Clock },
  { q: "Can I request multiple items at once?", a: "Absolutely - you can submit multiple items in a single request and we will price and ship them together.", category: "request", Icon: Layers },
  { q: "Can I change or cancel my order?", a: `You can request a cancellation or modification within 24 hours of placing your order. After that, your order may already be processed or shipped. Contact us as soon as possible at ${EMAIL} and we will do our best to accommodate you. Concierge requests can be cancelled any time before payment.`, category: "request", Icon: XCircle },
  { q: "What if the item cannot be found?", a: "If we are unable to source your item, you will not be charged. We may suggest similar alternatives you might love.", category: "request", Icon: Search },
  { q: "Will an item be restocked?", a: "Yes, in most cases. Use the Notify Me option on the product page, enter your email address, and we will alert you the moment the item is available again.", category: "request", Icon: BellRing },

  // Payment
  { q: "What payment methods do you accept?", a: "We accept major credit and debit cards (Visa, Mastercard, American Express), bank transfers and mobile money for Nigerian customers, as well as Apple Pay and Google Pay. All payments are processed securely.", category: "payment", Icon: CreditCard },
  { q: "Will I know the price before paying?", a: "Yes. For concierge requests, we send you a full quotation including item cost, shipping and duties before any payment is made. For in-stock items, the full price is always shown at checkout.", category: "payment", Icon: Tag },
  { q: "How do concierge payments work?", a: "After you approve the quotation, we send a secure payment link. Once payment clears, we begin sourcing your item.", category: "payment", Icon: ShieldCheck },
  { q: "Do you offer gift cards?", a: "Yes. ASL ORIGINALS gift cards are available in various denominations and can be used towards any product in our store. Gift cards are valid for 1 year from the date of purchase.", category: "payment", Icon: Gift },

  // Shipping
  { q: "How long does delivery take?", a: "Orders are processed within 1 - 3 business days. Most items are delivered within 7 - 14 business days depending on the sourcing location and your address. During busy periods, processing may take slightly longer.", category: "shipping", Icon: Calendar },
  { q: "Do you ship internationally?", a: "Yes, we ship to select countries worldwide. Delivery times and fees vary by destination and are shown at checkout. Please note that customs duties, taxes and import fees are the responsibility of the customer.", category: "shipping", Icon: Globe },
  { q: "Which shipping companies do you use?", a: "Within Nigeria, we work with trusted local shipping partners and our own in-house logistics team. For international shipments, we rely on DHL and UPS for reliable, timely delivery.", category: "shipping", Icon: Truck },
  { q: "How do I track my order?", a: `Once your order ships, you will receive an email with a tracking number to use on the carrier's website. You can also track your order inside the app under Track Your Order. If you have not received a tracking number, contact us at ${EMAIL}.`, category: "shipping", Icon: MapPin },
  { q: "How will my order be packaged?", a: "We ship items in their original branded packaging whenever possible. All orders are securely packed in protective boxes or bags, and some orders may arrive in our ASL ORIGINALS branded packaging. Display items may not include original packaging, but are packed with extra care.", category: "shipping", Icon: Box },
  { q: "Can I change my shipping address after ordering?", a: `If your shipping address is incorrect, contact us immediately at ${EMAIL}. We will do our best to update it before your order ships, but once an order is processed or dispatched, changes may no longer be possible.`, category: "shipping", Icon: FileEdit },
  { q: "My order is delayed. What is happening?", a: `Delays can occur when billing and shipping addresses differ (extra security verification), when an item is temporarily backordered, or when international shipping details are incomplete. We sincerely apologise for any inconvenience - reach out to ${EMAIL} for an update and we will resolve it as quickly as possible.`, category: "shipping", Icon: Clock },

  // Returns
  { q: "What is your return and refund policy?", a: "Items may be returned within 14 days of delivery in their original condition, unworn and with all tags attached. Refunds are issued to the original payment method after the returned item is inspected. Sourced concierge items are final sale unless they arrive damaged, incorrect or inauthentic. See our Return & Refund Policy for full details.", category: "returns", Icon: RotateCcw },
  { q: "My order arrived damaged or incorrect. What do I do?", a: "We sincerely apologise. Contact us within 48 hours of delivery with photos and a description of the issue, and we will gladly arrange a replacement or refund.", category: "returns", Icon: PackageX },
  { q: "My refund is delayed. What should I do?", a: `Refunds are processed after we receive and inspect your returned item. If your refund seems delayed, contact our customer service team at ${EMAIL} and we will look into it immediately.`, category: "returns", Icon: RefreshCw },

  // Other
  { q: "Are your products authentic?", a: "Yes. Every product sold at ASL ORIGINALS is 100% authentic and sourced from trusted suppliers. We guarantee the quality and authenticity of every item you purchase from us.", category: "other", Icon: BadgeCheck },
  { q: "How do I find my size, and how do I care for my items?", a: `We provide detailed size guides for each product, tailored to the brand and fit, so you can shop with confidence. Care instructions and material composition are provided whenever possible. Still unsure? Contact us at ${EMAIL} and we will be happy to assist.`, category: "other", Icon: Ruler },
  { q: "Do you offer discounts, sales or a loyalty program?", a: "We run special promotions and seasonal sales throughout the year, announced through our newsletter and social channels. Our loyalty program lets you earn points on purchases that can be redeemed for future discounts - our way of thanking you for your continued support.", category: "other", Icon: Percent },
  { q: "Do you offer wholesale or bulk purchasing?", a: `Yes, we offer wholesale and bulk purchasing for businesses and resellers. For large or custom orders, reach out to our sales team at ${EMAIL} for more information.`, category: "other", Icon: Package },
  { q: "I forgot my account password. What do I do?", a: "Tap Forgot Password on the sign-in page, enter your email address, and we will send you a link to reset your password.", category: "other", Icon: KeyRound },
  { q: "How do I contact customer service?", a: `You can reach us at ${EMAIL}. Our customer service team is available during business hours (Monday to Friday, 9 AM - 7 PM) and is always happy to help.`, category: "other", Icon: Headphones },
];

export const faqTrust = [
  { Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", sub: "Every item is 100% authentic or your money back." },
  { Icon: Lock, title: "SECURE PAYMENT", sub: "Your payment is safe with us. Multiple secure options." },
  { Icon: Globe2, title: "WORLDWIDE SOURCING", sub: "Access exclusive and sold-out items worldwide." },
  { Icon: Headphones, title: "DEDICATED SUPPORT", sub: "Our team is here to assist you every step of the way." },
];
