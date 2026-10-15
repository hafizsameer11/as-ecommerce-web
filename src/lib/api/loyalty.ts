import { apiRequest, apiRequestWithMeta, koboToNaira, nairaToKobo } from "./client";

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type ApiDrop = {
  id: string;
  releaseAt: string;
  allocation: number;
  reservedCount: number;
  remaining?: number;
  teaser: string;
  status: string;
  depositPct: number;
  deposit: number;
  balance: number;
  product: {
    id: string;
    productId?: string;
    brand: string;
    name: string;
    price: number;
    image: string | null;
    sizes?: string[];
    category?: string;
  };
  myReservation?: { id: string; number: string; status: string } | null;
};

export type ApiReservation = {
  id: string;
  number: string;
  status: string;
  statusLabel?: string;
  drop: { id: string; releaseAt: string; status: string };
  product: { id: string; name: string; brand: string; image: string | null };
  size?: string | null;
  price: number;
  deposit: number;
  balance: number;
  depositPct?: number;
  balancePaid?: boolean;
  canCancel?: boolean;
  createdAt: string;
};

export type ClubSummary = {
  points: number;
  pointsValue: number;
  credit: number;
  tier: { id: string; name: string; minSpend?: number; multiplier?: number } | null;
  multiplier: number;
  perks: string[];
  nextTier: { id: string; name: string; minSpend: number; multiplier: number } | null;
  spend12m: number;
  spendToNext: number;
  progressPct: number;
  tiers: Array<{ id: string; name: string; current?: boolean; reached?: boolean; minSpend?: number }>;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  memberSince?: string;
};

export type ClubRewardCard = {
  id: string;
  title: string;
  description?: string;
  cost: number;
  category: string;
  canRedeem?: boolean;
  lockedReason?: string | null;
};

export type MyReferrals = {
  enabled: boolean;
  status: string;
  code: string;
  link: string;
  headline?: string;
  subhead?: string;
  advocateReward?: { type: string; value: number; label?: string };
  friendReward?: { type: string; value: number; label?: string };
  stats: { clicks: number; invited: number; joined: number; pending: number; earned: number };
  friends: Array<{ name?: string; email?: string; status: string; reward?: number }>;
};

export const loyaltyApi = {
  clubSummary: () => apiRequest<ClubSummary>("/store/me/club"),
  clubHistory: () => apiRequest("/store/me/club/history"),
  clubRewards: () => apiRequest<ClubRewardCard[]>("/store/me/club/rewards"),
  redeemReward: (id: string) =>
    apiRequest(`/store/me/club/rewards/${encodeURIComponent(id)}/redeem`, {
      method: "POST",
      idempotencyKey: `cr_${crypto.randomUUID()}`,
    }),

  myReferrals: () => apiRequest<MyReferrals>("/store/me/referrals"),
  clickReferral: (code: string) =>
    apiRequest(`/store/referrals/click/${encodeURIComponent(code)}`, {
      method: "POST",
      body: {},
    }),

  listDrops: () => apiRequest<ApiDrop[]>("/store/drops"),
  getDrop: (id: string) => apiRequest<ApiDrop>(`/store/drops/${encodeURIComponent(id)}`),
  reserveDrop: (id: string, body: { size?: string; color?: string } = {}) =>
    apiRequest<{ reservation: ApiReservation; payment: { authorizationUrl?: string | null } | null }>(
      `/store/drops/${encodeURIComponent(id)}/reserve`,
      {
        method: "POST",
        body,
        idempotencyKey: `dr_${crypto.randomUUID()}`,
      }
    ),

  myReservations: (query: { tab?: string } = {}) =>
    apiRequest<ApiReservation[]>(`/store/me/reservations${qs(query)}`),

  cancelReservation: (id: string, reason?: string) =>
    apiRequest(`/store/me/reservations/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: { reason },
    }),

  payReservationBalance: (
    id: string,
    body: { method?: "card" | "bank_transfer"; returnUrl?: string } = {}
  ) =>
    apiRequest<{
      reservation: ApiReservation;
      payment: { authorizationUrl?: string | null; reference?: string } | null;
    }>(`/store/me/reservations/${encodeURIComponent(id)}/pay-balance`, {
      method: "POST",
      body,
      idempotencyKey: `rb_${crypto.randomUUID()}`,
    }),

  createConciergeRequest: async (fields: Record<string, string | number | undefined>, files?: File[]) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      if (v === undefined || v === "") continue;
      fd.append(k, String(v));
    }
    for (const f of files ?? []) fd.append("images", f);
    return apiRequest("/store/concierge/requests", { method: "POST", rawBody: fd });
  },

  myConciergeRequests: (query: { tab?: string; page?: number; pageSize?: number; q?: string } = {}) =>
    apiRequestWithMeta<ApiConciergeRequest[]>(`/store/concierge/requests${qs(query)}`),

  getConciergeRequest: (id: string) =>
    apiRequest<ApiConciergeRequest>(`/store/concierge/requests/${encodeURIComponent(id)}`),

  cancelConciergeRequest: (id: string, reason?: string) =>
    apiRequest(`/store/concierge/requests/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: { reason },
    }),

  conciergeCart: () => apiRequest<ApiConciergeCart>("/store/concierge/cart"),

  getConciergeQuote: (requestId: string) =>
    apiRequest(`/store/concierge/requests/${encodeURIComponent(requestId)}/quote`),

  acceptConciergeQuote: (
    requestId: string,
    body: {
      addressId?: string;
      address?: Record<string, string>;
      method?: "card" | "bank_transfer";
      returnUrl?: string;
    } = {}
  ) =>
    apiRequest<{ quote: unknown; payment: { authorizationUrl?: string | null; reference?: string } | null }>(
      `/store/concierge/requests/${encodeURIComponent(requestId)}/quote/accept`,
      {
        method: "POST",
        body,
        idempotencyKey: `ca_${crypto.randomUUID()}`,
      }
    ),

  payConciergeBalance: (
    requestId: string,
    body: { method?: "card" | "bank_transfer"; returnUrl?: string } = {}
  ) =>
    apiRequest<{ payment: { authorizationUrl?: string | null; reference?: string } | null }>(
      `/store/concierge/requests/${encodeURIComponent(requestId)}/pay-balance`,
      {
        method: "POST",
        body,
        idempotencyKey: `cb_${crypto.randomUUID()}`,
      }
    ),

  trackConcierge: (number: string, email?: string) =>
    apiRequest<ApiConciergeTrack>(
      `/store/concierge/track/${encodeURIComponent(number)}${qs({ email })}`
    ),
};

export type ApiConciergeRequest = {
  id: string;
  number: string;
  source?: string;
  productId?: string | null;
  itemName: string;
  brand?: string | null;
  category?: string | null;
  size?: string | null;
  color?: string | null;
  condition?: string | null;
  qty?: number;
  image?: string | null;
  status: string;
  statusKey?: string;
  cartStatus?: string;
  statusNote?: string;
  price?: number | null;
  quote?: { id: string; number?: string; total?: number; deposit?: number; amountDue?: number; status?: string } | null;
  unread?: number;
  createdAt: string;
  updatedAt?: string;
  trackStep?: number | null;
  timeline?: Array<{ id: string; kind: string; text: string; by?: string; at: string }>;
  currentQuote?: unknown;
  canCancel?: boolean;
};

export type ApiConciergeCart = {
  items: ApiConciergeRequest[];
  count: number;
  summary: {
    subtotal: number;
    serviceFee: number;
    shippingEstimate: number;
    estimatedTotal: number;
  };
};

export type ApiConciergeTrack = {
  number: string;
  itemName: string;
  brand?: string | null;
  category?: string | null;
  size?: string | null;
  color?: string | null;
  image?: string | null;
  status: string;
  statusKey?: string;
  statusNote?: string;
  trackStep?: number | null;
  createdAt: string;
  updatedAt?: string;
  timeline?: Array<{ id: string; kind: string; text: string; by?: string; at: string }>;
  quote?: unknown;
};

export { koboToNaira, nairaToKobo };
