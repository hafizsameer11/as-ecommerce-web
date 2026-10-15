import { create } from "zustand";
import {
  cmsApi,
  type ApiTicket,
  type ApiTicketMessage,
  type TicketCategory,
  type TicketStatusKey,
} from "@/lib/api/cms";

export type TicketStatus = TicketStatusKey;
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketChannel = "email" | "chat" | "whatsapp" | "instagram" | "phone" | "web" | "app";
export type { TicketCategory };

export type TicketMessage = {
  id: string;
  author: "customer" | "agent" | "system";
  authorName: string;
  body: string;
  at: number;
  internal?: boolean;
};

export type Ticket = {
  id: string;
  number: string;
  subject: string;
  status: TicketStatus;
  statusLabel: string;
  priority: TicketPriority;
  channel: TicketChannel;
  category: TicketCategory;
  customerName: string;
  customerEmail: string;
  orderRef?: string;
  assignee?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  slaDueAt: number;
  messages: TicketMessage[];
  customerCreated?: boolean;
  canReply?: boolean;
  canReopen?: boolean;
};

function toMs(v: string | number | Date | undefined | null) {
  if (v == null) return Date.now();
  if (typeof v === "number") return v;
  return new Date(v).getTime();
}

function mapMessage(m: ApiTicketMessage): TicketMessage {
  return {
    id: m.id,
    author: m.author,
    authorName: m.authorName,
    body: m.body,
    at: toMs(m.at),
  };
}

function mapTicket(t: ApiTicket): Ticket {
  const messages = (t.messages ?? []).map(mapMessage);
  if (!messages.length && t.lastMessage) {
    messages.push({
      id: `${t.id}-last`,
      author: (t.lastMessage.author as TicketMessage["author"]) || "system",
      authorName: t.lastMessage.author === "customer" ? "You" : "ASL ORIGINALS",
      body: t.lastMessage.body,
      at: toMs(t.lastMessage.at),
    });
  }
  return {
    id: t.id,
    number: t.number,
    subject: t.subject,
    status: t.statusKey,
    statusLabel: t.status,
    priority: "normal",
    channel: "web",
    category: t.category ?? "other",
    customerName: "You",
    customerEmail: "",
    orderRef: t.orderRef ?? undefined,
    tags: [],
    createdAt: toMs(t.createdAt),
    updatedAt: toMs(t.updatedAt),
    slaDueAt: toMs(t.updatedAt),
    messages,
    customerCreated: true,
    canReply: t.canReply,
    canReopen: t.canReopen,
  };
}

type State = {
  tickets: Ticket[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  getTicket: (id: string) => Promise<Ticket | null>;
  createFromCustomer: (input: {
    subject: string;
    body: string;
    category?: TicketCategory;
    channel?: "web" | "app";
    customerName?: string;
    customerEmail?: string;
    orderRef?: string;
  }) => Promise<{ id: string; reference: string }>;
  contact: (input: {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
    orderRef?: string;
  }) => Promise<{ id: string; reference: string }>;
  customerReply: (id: string, body: string) => Promise<void>;
  reopen: (id: string) => Promise<void>;
  /** @deprecated use reopen */
  setStatus: (id: string, status: TicketStatus) => void;
};

export const useTickets = create<State>()((set, get) => ({
  tickets: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const rows = await cmsApi.myTickets({ tab: "all" });
      set({ tickets: (rows ?? []).map(mapTicket), hydrated: true });
    } catch (err) {
      console.warn("[tickets] hydrate failed", err);
      set({ hydrated: true });
    }
  },
  getTicket: async (id) => {
    try {
      const row = await cmsApi.myTicket(id);
      const ticket = mapTicket(row);
      set((s) => ({
        tickets: s.tickets.some((t) => t.id === ticket.id)
          ? s.tickets.map((t) => (t.id === ticket.id ? ticket : t))
          : [ticket, ...s.tickets],
      }));
      return ticket;
    } catch (err) {
      console.warn("[tickets] getTicket failed", err);
      return get().tickets.find((t) => t.id === id) ?? null;
    }
  },
  createFromCustomer: async (input) => {
    const fields: Record<string, string> = {
      topic: input.subject,
      message: input.body,
      channel: input.channel ?? "web",
    };
    if (input.category) fields.category = input.category;
    if (input.orderRef) fields.orderRef = input.orderRef;
    const created = await cmsApi.createTicket(fields);
    const ticket = mapTicket(created);
    set((s) => ({ tickets: [ticket, ...s.tickets.filter((t) => t.id !== ticket.id)] }));
    return { id: created.id, reference: created.reference || created.number };
  },
  contact: async (input) => {
    const created = await cmsApi.contact(input);
    void get().hydrate();
    return { id: created.id, reference: created.reference || created.number };
  },
  customerReply: async (id, body) => {
    const updated = await cmsApi.replyTicket(id, body);
    const ticket = mapTicket(updated);
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? ticket : t)),
    }));
  },
  reopen: async (id) => {
    const updated = await cmsApi.reopenTicket(id);
    const ticket = mapTicket(updated);
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? ticket : t)),
    }));
  },
  setStatus: (id, status) => {
    if (status === "open") void get().reopen(id);
  },
}));
