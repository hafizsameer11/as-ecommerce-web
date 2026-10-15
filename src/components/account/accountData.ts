import {
  Home,
  Receipt,
  ShoppingBag,
  ClipboardList,
  Heart,
  MapPin,
  User,
  Crown,
  BadgeCheck,
  Bell,
  RefreshCw,
  HelpCircle,
  Settings,
  LogOut,
  LucideIcon,
  Star,
  Percent,
  Truck,
  Headphones,
  Gift,
  Package,
  FileText,
  CheckCircle2,
  Award,
  CreditCard,
  Wallet,
  Wand2,
  Clock,
  Lock,
  Info,
  MessageSquare,
} from "lucide-react";

export type MenuItem = {
  id: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  to?: string;
  badge?: string;
  external?: "app-store";
};

export type MenuSection = {
  id: string;
  label?: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  Icon?: LucideIcon;
};

export const sideNavSections: MenuSection[] = [
  {
    id: "shop",
    label: "Shopping",
    items: [
      { id: "overview", label: "Overview", desc: "", Icon: Home, to: "/account" },
      { id: "orders", label: "Orders", desc: "", Icon: Receipt, to: "/account/orders" },
      { id: "wishlist", label: "Wishlist", desc: "", Icon: Heart, badge: "4", to: "/account/wishlist" },
      { id: "coming-soon", label: "Coming Soon & Reservations", desc: "", Icon: Clock, to: "/coming-soon" },
      { id: "returns", label: "Returns & Exchanges", desc: "", Icon: RefreshCw, to: "/account/returns" },
      { id: "notifications", label: "Notifications", desc: "", Icon: Bell, to: "/account/notifications" },

    ],
  },
  {
    id: "concierge",
    label: "Fashion Concierge",
    Icon: Wand2,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: "requests", label: "My Requests", desc: "", Icon: ClipboardList, to: "/account/requests" },
      { id: "track", label: "Track Request", desc: "", Icon: Truck, to: "/track-request" },

    ],
  },
  {
    id: "club",
    label: "ASL Club",
    Icon: Crown,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: "benefits", label: "ASL Club Benefits", desc: "", Icon: BadgeCheck, to: "/account/benefits" },
      { id: "rewards", label: "Rewards & Credits", desc: "", Icon: Star, to: "/account/rewards" },
    ],
  },
  {
    id: "wallet-group",
    items: [
      { id: "wallet", label: "Wallet & Transactions", desc: "", Icon: Wallet, to: "/account/wallet" },
    ],
  },
  {
    id: "profile",
    label: "Account",
    items: [
      { id: "address", label: "Address Book", desc: "", Icon: MapPin, to: "/account/addresses" },
      { id: "details", label: "Account Details", desc: "", Icon: User, to: "/account/details" },
      { id: "payment-methods", label: "Payment Methods", desc: "", Icon: CreditCard, to: "/account/payment-methods" },
      { id: "security", label: "Security", desc: "", Icon: BadgeCheck, to: "/account/security" },
      { id: "referrals", label: "Invite Friends", desc: "", Icon: Gift, to: "/account/referrals" },
      { id: "settings", label: "Account Settings", desc: "", Icon: Settings, to: "/account/settings" },


    ],
  },
  {
    id: "app",
    label: "App",
    items: [
      { id: "privacy", label: "Privacy", desc: "", Icon: Lock, to: "/customer-care/privacy-policy" },
      { id: "about", label: "About", desc: "", Icon: Info, to: "/customer-care/about-us" },
      { id: "feedback", label: "Send Feedback", desc: "", Icon: MessageSquare, to: "/account/feedback" },
      { id: "rate-app", label: "Rate The App", desc: "", Icon: Star, external: "app-store" },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [
      { id: "help", label: "Help & Support", desc: "", Icon: HelpCircle, to: "/account/help" },
      { id: "logout", label: "Logout", desc: "", Icon: LogOut },
    ],
  },

];


// Flat list retained for compatibility
export const sideNav: MenuItem[] = sideNavSections.flatMap((s) => s.items);


export const overviewBenefits = [
  { id: "exclusive", title: "Exclusive\nAccess", desc: "Early access to\nnew arrivals & drops", Icon: Star },
  { id: "discounts", title: "Member\nDiscounts", desc: "Special prices\njust for you", Icon: Percent },
  { id: "shipping", title: "Free\nShipping", desc: "Free shipping on all\norders over ₦50,000", Icon: Truck },
  { id: "support", title: "Priority\nSupport", desc: "Faster response\njust for members", Icon: Headphones },
  { id: "birthday", title: "Birthday Treat", desc: "Special surprise\non your birthday", Icon: Gift },
];

export const overviewQuickLinks = [
  { id: "orders", label: "My Orders", desc: "Track, return or buy again", Icon: Package, cta: "View Orders", to: "/account/orders" },
  { id: "wishlist", label: "Wishlist", desc: "Your saved items", Icon: Heart, cta: "View Wishlist", count: 4 },
  { id: "address", label: "Address Book", desc: "Manage your saved addresses", Icon: MapPin, cta: "Manage" },
  { id: "details", label: "Account Details", desc: "Edit your personal information", Icon: User, cta: "Edit" },
];

export const mobileOverviewLinks = [
  { id: "orders", label: "My Orders", desc: "Track, return or buy again", Icon: Package, to: "/account/orders" },
  { id: "wishlist", label: "Wishlist", desc: "Your saved items", Icon: Heart, count: 4 },
  { id: "address", label: "Address Book", desc: "Manage your addresses", Icon: MapPin },
  { id: "details", label: "Account Details", desc: "Edit your personal information", Icon: User },
  { id: "returns", label: "Returns & Exchanges", desc: "Manage returns & exchanges", Icon: RefreshCw, to: "/account/returns" },
  { id: "help", label: "Help & Support", desc: "Get help and support", Icon: HelpCircle },
];

export const mobileOverviewList: MenuItem[] = [
  { id: "orders", label: "My Orders", desc: "Track, return or buy again", Icon: Package, to: "/account/orders" },
  { id: "wishlist", label: "Wishlist", desc: "Your saved items", Icon: Heart, badge: "4" },
  { id: "address", label: "Address Book", desc: "Manage your saved addresses", Icon: MapPin },
  { id: "details", label: "Account Details", desc: "Edit your personal information", Icon: User },
  { id: "returns", label: "Returns & Exchanges", desc: "Manage returns & exchanges", Icon: RefreshCw, to: "/account/returns" },
  { id: "wallet", label: "Wallet & Transactions", desc: "Balance & history", Icon: Wallet, to: "/account/wallet" },
  { id: "help", label: "Help & Support", desc: "Get help and support", Icon: HelpCircle, to: "/account/help" },
];

export const mobileConciergeList: MenuItem[] = [
  { id: "requests", label: "My Requests", desc: "View all your concierge requests", Icon: ClipboardList, to: "/account/requests" },
  { id: "track", label: "Track Request", desc: "Live status of active requests", Icon: Truck, to: "/track-request" },

];

export const mobileClubList: MenuItem[] = [
  { id: "benefits", label: "ASL Club Benefits", desc: "Your membership perks", Icon: BadgeCheck, to: "/account/benefits" },
  { id: "rewards", label: "Rewards & Credits", desc: "Points, tier & credits", Icon: Star, to: "/account/rewards" },
];



export const menuList: MenuItem[] = [
  { id: "benefits", label: "Membership Benefits", desc: "View your member benefits and perks", Icon: BadgeCheck },
  { id: "progress", label: "Your Progress & Rewards", desc: "Check your progress and available rewards", Icon: Star },
  { id: "credits", label: "Credits & Refunds", desc: "View your credit balance and refund history", Icon: CreditCard },
  { id: "wallet", label: "Wallet & Transactions", desc: "View your wallet balance and transaction history", Icon: Wallet },
  { id: "returns", label: "Returns & Refunds", desc: "View your return and refund history", Icon: RefreshCw },
  { id: "settings", label: "Account Settings", desc: "Manage your account settings and preferences", Icon: Settings },
  { id: "help", label: "Help & Support", desc: "Get help and contact our support team", Icon: HelpCircle },
];

export const mobileMenu: MenuItem[] = [
  { id: "requests", label: "My Requests", desc: "", Icon: ShoppingBag },
  { id: "track", label: "Track Request", desc: "", Icon: MapPin },
  { id: "benefits", label: "Membership Benefits", desc: "", Icon: BadgeCheck },
  { id: "rewards", label: "Rewards & Credits", desc: "", Icon: Star },
  { id: "wallet", label: "Wallet & Transactions", desc: "", Icon: CreditCard },
  { id: "returns", label: "Returns & Refunds", desc: "", Icon: RefreshCw },
  { id: "settings", label: "Account Settings", desc: "", Icon: Settings },
  { id: "help", label: "Help & Support", desc: "", Icon: HelpCircle },
];

export type StatusKey = "In Transit" | "Order Confirmed" | "Sourcing" | "Completed" | "Cancelled";

export const statusStyle: Record<StatusKey, string> = {
  "In Transit": "bg-ink text-white",
  "Order Confirmed": "bg-sky-100 text-sky-700",
  "Sourcing": "bg-amber-100 text-amber-700",
  "Completed": "bg-neutral-200 text-neutral-700",
  "Cancelled": "bg-rose-100 text-rose-700",
};

export type RecentRequest = {
  id: string;
  name: string;
  detail: string;
  size?: string;
  colour?: string;
  condition?: string;
  status: StatusKey;
  date: string;
  update: string;
  image: string;
};

export const recentRequests: RecentRequest[] = [
  {
    id: "ASL123456",
    name: "Air Jordan 1 Retro High OG",
    detail: "Black Toe Reimagined",
    size: "UK 9",
    colour: "Black/White/Red",
    status: "Sourcing",
    date: "May 25, 2024",
    update: "We're sourcing your item from our network.",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ASL123455",
    name: "Louis Vuitton Keepall",
    detail: "Bandoulière 50 Monogram",
    condition: "New",
    colour: "Brown",
    status: "Order Confirmed",
    date: "May 23, 2024",
    update: "Your order has been confirmed.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ASL123454",
    name: "Rolex Submariner Date",
    detail: "126610LN",
    condition: "New",
    colour: "Silver/Black",
    status: "In Transit",
    date: "May 20, 2024",
    update: "Your item is on the way.",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ASL123453",
    name: "Gentle Monster Lilit 01",
    detail: "Sunglasses",
    colour: "Black",
    status: "Completed",
    date: "May 15, 2024",
    update: "Your item has been delivered.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "ASL123452",
    name: "Yeezy Boost 350 V2",
    detail: "Bone",
    size: "UK 9",
    colour: "Bone",
    status: "Cancelled",
    date: "May 10, 2024",
    update: "This request has been cancelled.",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=200&q=80",
  },
];

export const stats = [
  { id: "active", label: "Active Requests", value: "3", cta: "View all", Icon: FileText },
  { id: "completed", label: "Completed Requests", value: "12", cta: "View all", Icon: CheckCircle2 },
  { id: "rewards", label: "Rewards Points", value: "2,450", cta: "View rewards", Icon: Award },
  { id: "credit", label: "Available Credit", value: "₦25,000", cta: "View wallet", Icon: CreditCard },
];
