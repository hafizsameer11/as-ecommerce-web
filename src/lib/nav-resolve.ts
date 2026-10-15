// Central mapping from human labels to app routes so we can eliminate
// dead " - coming soon" placeholders across the app.

import { storeProfileContact } from "@/lib/public-settings-format";
import { usePublicSettingsStore } from "@/lib/public-settings-store";

const profileContact = () => storeProfileContact(usePublicSettingsStore.getState().settings);

export type NavTarget =
  | { kind: "route"; to: string }
  | { kind: "external"; href: string }
  | { kind: "none" };

const map: Record<string, NavTarget> = {};
const add = (labels: string[], target: NavTarget) => {
  for (const l of labels) map[l.toLowerCase().trim()] = target;
};

// Header / shell
add(["Menu"], { kind: "none" });
add(["Bag", "Cart", "Shopping Bag", "Shopping Cart"], { kind: "route", to: "/cart" });
add(["Search"], { kind: "route", to: "/search" });
add(["Account", "My Account", "Profile"], { kind: "route", to: "/account" });
add(["Wishlist", "Favorites"], { kind: "route", to: "/account/wishlist" });
add(["Notifications"], { kind: "route", to: "/account/notifications" });
add(["Settings"], { kind: "route", to: "/account/settings" });

// Top / primary nav
add(["Home", "HOME"], { kind: "route", to: "/" });
add(["Shop", "SHOP"], { kind: "route", to: "/shop" });
add(["New & Trending", "New", "New In", "Trending", "Trending Now"], { kind: "route", to: "/trending" });
add(["New Arrivals"], { kind: "route", to: "/new-arrivals" });
add(["Brands", "Shop by Brand", "All Brands"], { kind: "route", to: "/brands" });
add(["Best Sellers"], { kind: "route", to: "/best-sellers" });
add(["Coming Soon", "Coming Soon & Reservations", "Drops", "Upcoming Drops", "My Reservations", "Reservations"], { kind: "route", to: "/coming-soon" });

add(["Sale", "SALE", "Sales"], { kind: "route", to: "/shop/sales" });
add(["Categories", "CATEGORIES", "Browse", "Browse All"], { kind: "route", to: "/shop/browse" });
add(["Fashion Concierge", "CONCIERGE SERVICE", "Concierge Service", "Concierge"], { kind: "route", to: "/concierge-service" });
add(["Concierge Categories"], { kind: "route", to: "/concierge-categories" });
add(["How It Works", "HOW IT WORKS"], { kind: "route", to: "/how-it-works" });
add(["Track Request", "TRACK REQUEST", "Track", "Track Order"], { kind: "route", to: "/track-request" });
add(["Start Request", "Request", "Submit Custom Request", "Start Your Request", "START YOUR REQUEST NOW"], { kind: "route", to: "/start-request" });
add(["Track My Request"], { kind: "route", to: "/track-request" });

// Support / footer
add(["FAQ", "FAQs", "FAQ / Help"], { kind: "route", to: "/customer-care/faqs" });
add(["Contact", "Contact Us", "Contact Details", "CONTACT US"], { kind: "route", to: "/customer-care/contact-us" });
add(["About", "About Us"], { kind: "route", to: "/customer-care/about-us" });
add(["Our Commitment"], { kind: "route", to: "/customer-care/our-commitment" });
add(["Terms of Service", "Terms"], { kind: "route", to: "/customer-care/terms-of-service" });
add(["Privacy Policy", "Privacy"], { kind: "route", to: "/customer-care/privacy-policy" });
add(["Cookie Policy"], { kind: "route", to: "/customer-care/cookie-policy" });
add(["Refund Policy"], { kind: "route", to: "/customer-care/refund-policy" });
add(["Shipping Policy"], { kind: "route", to: "/customer-care/shipping-policy" });
add(["Return Policy"], { kind: "route", to: "/customer-care/return-policy" });
add(["Customer Care", "Help", "Help & Support", "Support"], { kind: "route", to: "/customer-care" });

// Account inner
add(["Orders", "My Orders", "Order History"], { kind: "route", to: "/account/orders" });
add(["My Requests", "Requests"], { kind: "route", to: "/account/requests" });
add(["Returns"], { kind: "route", to: "/account/returns" });
add(["Rewards"], { kind: "route", to: "/account/rewards" });
add(["Wallet"], { kind: "route", to: "/account/wallet" });
add(["Payment Methods"], { kind: "route", to: "/account/payment-methods" });
add(["Address Book", "Addresses"], { kind: "route", to: "/account/addresses" });
add(["Referrals", "Invite Friends"], { kind: "route", to: "/account/referrals" });
add(["Benefits", "Membership", "ASL Club"], { kind: "route", to: "/account/benefits" });
add(["Security"], { kind: "route", to: "/account/security" });
add(["Details", "Personal Details"], { kind: "route", to: "/account/details" });

// External
add(["Chat", "Chat with Us", "Chat with Us (WhatsApp)", "WhatsApp", "Opening WhatsApp"], {
  kind: "external", href: profileContact().whatsappUrl,
});
add(["Email"], { kind: "external", href: profileContact().mailtoUrl });
add(["Call", "Calling", "Phone"], { kind: "external", href: profileContact().telUrl });
add(["Instagram", "Follow Us"], { kind: "external", href: "https://instagram.com" });
add(["Facebook"], { kind: "external", href: "https://facebook.com" });
add(["Twitter", "X"], { kind: "external", href: "https://twitter.com" });
add(["Google Play"], { kind: "external", href: "https://play.google.com" });
add(["App Store"], { kind: "external", href: "https://apps.apple.com" });

export function resolveNav(label: string): NavTarget {
  const clean = label.replace(/\s+/g, " ").replace("\n", " ").trim();
  const key = clean.toLowerCase();
  const contact = profileContact();
  if (["chat", "chat with us", "chat with us (whatsapp)", "whatsapp", "opening whatsapp"].includes(key)) {
    return { kind: "external", href: contact.whatsappUrl };
  }
  if (key === "email") return { kind: "external", href: contact.mailtoUrl };
  if (["call", "calling", "phone"].includes(key)) return { kind: "external", href: contact.telUrl };
  return map[key] ?? { kind: "none" };
}

/**
 * Navigate to the target for a label. Falls back to `fallback` (default `/`)
 * if the label is unknown. Handles external URLs by opening in new tab.
 */
export function goToLabel(label: string, fallback: string = "/") {
  const t = resolveNav(label);
  if (t.kind === "route") {
    window.location.href = t.to;
  } else if (t.kind === "external") {
    window.open(t.href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = fallback;
  }
}
