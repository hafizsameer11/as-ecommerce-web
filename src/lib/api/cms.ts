import { apiRequest, apiRequestWithMeta } from "./client";

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type StoreBanner = {
  id: string;
  placement: string;
  priority: number;
  message: string;
  cta?: string | null;
  linkTo?: string | null;
  bg: string;
  fg: string;
  accent: string;
  style: string;
  icon?: string | null;
  dismissible: boolean;
};

export type StoreAnnouncement = {
  id: string;
  placement?: string;
  audience?: string;
  device?: string;
  priority?: number;
  message: string;
  emoji?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  style?: string;
  bg?: string;
  fg?: string;
  dismissible?: boolean;
  endsAt?: string | null;
};

export type StoreFaqCategory = { id: string; name: string; slug: string; icon?: string };
export type StoreFaqItem = {
  id: string;
  categoryId?: string;
  question: string;
  answer: string;
  featured?: boolean;
};

export type TicketStatusKey = "open" | "pending" | "on_hold" | "resolved" | "closed";
export type TicketCategory =
  | "order"
  | "delivery"
  | "returns"
  | "payment"
  | "product"
  | "concierge"
  | "account"
  | "other";

export type ApiTicketAttachment = { name: string; kind: "image" | "file"; url: string };

export type ApiTicketMessage = {
  id: string;
  author: "customer" | "agent" | "system";
  authorName: string;
  body: string;
  attachments?: ApiTicketAttachment[];
  at: string;
};

export type ApiTicket = {
  id: string;
  number: string;
  subject: string;
  category?: TicketCategory;
  orderRef?: string | null;
  statusKey: TicketStatusKey;
  status: string;
  canReply?: boolean;
  canReopen?: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: { author: string; body: string; at: string } | null;
  messageCount?: number;
  messages?: ApiTicketMessage[];
  reference?: string;
};

export type CreateTicketResult = ApiTicket & { reference: string; message?: string };

export type ContactResult = {
  id: string;
  number: string;
  reference: string;
  subject: string;
  status: string;
  createdAt: string;
  message?: string;
};

export type NotifPreferences = {
  channels: { push: boolean; email: boolean; sms: boolean };
  topics: { orders: boolean; concierge: boolean; shipping: boolean; promos: boolean; wishlist: boolean };
};

export const cmsApi = {
  feedback: (body: { type: "idea" | "bug" | "praise"; area?: string; message: string; email?: string }) =>
    apiRequest("/store/feedback", { method: "POST", body }),

  banners: (query: { placement?: string; device?: "mobile" | "desktop" } = {}) =>
    apiRequest<StoreBanner[]>(`/store/banners${qs(query)}`),

  announcements: () => apiRequest<StoreAnnouncement[]>("/store/announcements"),

  faqCategories: () => apiRequest<StoreFaqCategory[]>("/store/content/faqs/categories"),
  faqs: (query: { category?: string; featured?: boolean; q?: string } = {}) =>
    apiRequest<StoreFaqItem[]>(`/store/content/faqs${qs(query as Record<string, string | number | boolean | undefined>)}`),
  faqFeedback: (id: string, helpful: boolean) =>
    apiRequest(`/store/content/faqs/${encodeURIComponent(id)}/feedback`, {
      method: "POST",
      body: { helpful },
    }),

  pageBySlug: (slug: string) =>
    apiRequest(`/store/content/pages/${slug.split("/").map(encodeURIComponent).join("/")}`),

  notifications: (query: { tab?: string; page?: number } = {}) =>
    apiRequestWithMeta(`/store/me/notifications${qs(query)}`),
  unreadCount: () => apiRequest<{ count: number }>("/store/me/notifications/unread-count"),
  markRead: (id: string) =>
    apiRequest(`/store/me/notifications/${encodeURIComponent(id)}/read`, { method: "POST" }),
  markAllRead: (category?: string) =>
    apiRequest("/store/me/notifications/read-all", { method: "POST", body: { category } }),

  notificationPreferences: () => apiRequest<NotifPreferences>("/store/me/notification-preferences"),
  updateNotificationPreferences: (body: Record<string, unknown>) =>
    apiRequest<NotifPreferences>("/store/me/notification-preferences", { method: "PUT", body }),

  myTickets: (query: { tab?: string } = {}) =>
    apiRequest<ApiTicket[]>(`/store/me/tickets${qs(query)}`),
  myTicket: (id: string) =>
    apiRequest<ApiTicket>(`/store/me/tickets/${encodeURIComponent(id)}`),
  createTicket: async (fields: Record<string, string>, files?: File[]) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (v) fd.append(k, v);
    }
    for (const f of files ?? []) fd.append("attachments", f);
    return apiRequest<CreateTicketResult>("/store/support/tickets", { method: "POST", rawBody: fd });
  },
  replyTicket: async (id: string, body: string, files?: File[]) => {
    const fd = new FormData();
    fd.append("body", body);
    for (const f of files ?? []) fd.append("attachments", f);
    return apiRequest<ApiTicket>(`/store/me/tickets/${encodeURIComponent(id)}/messages`, {
      method: "POST",
      rawBody: fd,
    });
  },
  reopenTicket: (id: string) =>
    apiRequest<ApiTicket>(`/store/me/tickets/${encodeURIComponent(id)}/reopen`, { method: "POST" }),
  contact: (body: Record<string, unknown>) =>
    apiRequest<ContactResult>("/store/support/contact", { method: "POST", body }),
};
