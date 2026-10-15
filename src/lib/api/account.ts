import { apiRequest, koboToNaira, nairaToKobo } from "./client";

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type ApiOrderCard = {
  id: string;
  number: string;
  date: string;
  status: string;
  statusKey?: string;
  paymentStatus?: string;
  total: number;
  itemsCount: number;
  eta?: string | null;
  tracking?: string | null;
  canCancel?: boolean;
  canPay?: boolean;
  canReturn?: boolean;
  items: {
    name: string;
    brand?: string | null;
    variant: string;
    qty: number;
    price: number;
    image?: string | null;
  }[];
};

export type ApiOrderDetail = ApiOrderCard & {
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shipping: number;
  delivery?: string;
  payment?: string;
  amountPaid?: number;
  due?: number;
  contact?: { email?: string; phone?: string; subscribe?: boolean } | null;
  address?: Record<string, string> | null;
  timeline?: { type: string; title: string; detail?: string | null; at: string }[];
};

export type ApiAddress = {
  id: string;
  label: string;
  type: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode?: string | null;
  isDefault: boolean;
};

export type ApiWalletSummary = {
  balance: number;
  held: number;
  totalSpent: number;
  frozen: boolean;
  recent: ApiWalletTx[];
};

export type ApiWalletTx = {
  id: string;
  title: string;
  subtitle?: string | null;
  amount: number;
  status: string;
  kind?: string;
  createdAt: string;
};

export type ApiBankAccount = {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
};

export type ApiBank = { code: string; name: string };

export type ApiReturnCard = {
  id: string;
  number: string;
  status: string;
  statusLabel?: string;
  statusKey?: string;
  statusNote?: string;
  orderId?: string;
  orderNumber?: string;
  name?: string;
  detail?: string;
  size?: string;
  image?: string | null;
  itemsCount?: number;
  refundAmount?: number;
  total?: number;
  createdAt?: string;
  requestedOn?: string;
  reason?: string;
};

export type ApiReturnable = {
  orderId: string;
  orderNumber: string;
  status: string;
  statusKey?: string;
  deliveredAt?: string | null;
  windowDays?: number;
  windowEndsAt?: string | null;
  eligible: boolean;
  reason?: string | null;
  reasonText?: string | null;
  items: Array<{
    orderItemId: string;
    name: string;
    brand?: string | null;
    variant?: string | null;
    size?: string | null;
    image?: string | null;
    qty: number;
    returned?: number;
    returnable: number;
    reason?: string | null;
    reasonText?: string | null;
  }>;
  reasons: string[];
  photosRequiredFor?: string[];
  damagedReportHours?: number;
  maxPhotos?: number;
  refundOptions?: string[];
};

export const accountApi = {
  myOrders: (query: { status?: string; page?: number; pageSize?: number } = {}) =>
    apiRequest<ApiOrderCard[]>(`/store/me/orders${qs({ pageSize: 50, ...query })}`),

  myOrder: (id: string) =>
    apiRequest<ApiOrderDetail>(`/store/me/orders/${encodeURIComponent(id)}`),

  cancelOrder: (id: string, reason?: string) =>
    apiRequest(`/store/me/orders/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      body: { reason },
    }),

  reorder: (id: string) =>
    apiRequest(`/store/me/orders/${encodeURIComponent(id)}/reorder`, { method: "POST" }),

  payOrder: (id: string, returnUrl?: string) =>
    apiRequest<{ authorizationUrl?: string | null; reference: string }>(
      `/store/me/orders/${encodeURIComponent(id)}/pay`,
      {
        method: "POST",
        body: { returnUrl: returnUrl ?? null },
        idempotencyKey: `op_${crypto.randomUUID()}`,
      },
    ),

  lookupOrder: (orderNumber: string, email: string) =>
    apiRequest<ApiOrderDetail>("/store/orders/lookup", {
      method: "POST",
      body: { orderNumber, email },
    }),

  orderByToken: (token: string) =>
    apiRequest<ApiOrderDetail>(`/store/orders/by-token/${encodeURIComponent(token)}`),

  addresses: () => apiRequest<ApiAddress[]>("/store/me/addresses"),

  address: (id: string) =>
    apiRequest<ApiAddress>(`/store/me/addresses/${encodeURIComponent(id)}`),

  createAddress: (body: Record<string, unknown>) =>
    apiRequest<ApiAddress>("/store/me/addresses", { method: "POST", body }),

  updateAddress: (id: string, body: Record<string, unknown>) =>
    apiRequest<ApiAddress>(`/store/me/addresses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),

  setDefaultAddress: (id: string) =>
    apiRequest<ApiAddress[]>(`/store/me/addresses/${encodeURIComponent(id)}/default`, {
      method: "POST",
    }),

  deleteAddress: (id: string) =>
    apiRequest(`/store/me/addresses/${encodeURIComponent(id)}`, { method: "DELETE" }),

  wallet: () => apiRequest<ApiWalletSummary>("/store/me/wallet"),

  walletTransactions: (query: { page?: number; pageSize?: number } = {}) =>
    apiRequest<ApiWalletTx[]>(`/store/me/wallet/transactions${qs({ pageSize: 50, ...query })}`),

  walletTopup: (body: { amount: number; method: "card" | "bank_transfer"; returnUrl?: string }) =>
    apiRequest<{ authorizationUrl?: string | null; reference: string }>("/store/me/wallet/topup", {
      method: "POST",
      body,
      idempotencyKey: `wt_${crypto.randomUUID()}`,
    }),

  walletWithdraw: (body: { amount: number; bankAccountId: string }) =>
    apiRequest("/store/me/wallet/withdraw", {
      method: "POST",
      body,
      idempotencyKey: `ww_${crypto.randomUUID()}`,
    }),

  bankAccounts: () => apiRequest<ApiBankAccount[]>("/store/me/bank-accounts"),

  addBankAccount: (body: { bankCode: string; accountNumber: string }) =>
    apiRequest<ApiBankAccount>("/store/me/bank-accounts", { method: "POST", body }),

  removeBankAccount: (id: string) =>
    apiRequest(`/store/me/bank-accounts/${encodeURIComponent(id)}`, { method: "DELETE" }),

  banks: () => apiRequest<ApiBank[]>("/store/banks"),

  resolveBankAccount: (body: { bankCode: string; accountNumber: string }) =>
    apiRequest<{ accountName: string }>("/store/banks/resolve", { method: "POST", body }),

  myReturns: (query: { status?: string; page?: number; pageSize?: number } = {}) =>
    apiRequest<ApiReturnCard[]>(`/store/me/returns${qs({ pageSize: 50, ...query })}`),

  myReturn: (id: string) =>
    apiRequest(`/store/me/returns/${encodeURIComponent(id)}`),

  returnable: (orderId: string) =>
    apiRequest<ApiReturnable>(`/store/me/orders/${encodeURIComponent(orderId)}/returnable`),

  createReturn: async (
    body: {
      orderId: string;
      items: Array<{ orderItemId: string; qty: number }>;
      reason: string;
      details?: string;
      refundTo?: "original" | "wallet";
    },
    photos?: File[],
  ) => {
    const fd = new FormData();
    fd.append("orderId", body.orderId);
    fd.append("items", JSON.stringify(body.items));
    fd.append("reason", body.reason);
    if (body.details) fd.append("details", body.details);
    fd.append("refundTo", body.refundTo ?? "original");
    for (const file of photos ?? []) {
      fd.append("photos", file);
    }
    return apiRequest(`/store/me/returns`, {
      method: "POST",
      rawBody: fd,
      idempotencyKey: `ret_${crypto.randomUUID()}`,
    });
  },

  paymentMethods: () =>
    apiRequest<
      Array<{
        id: string;
        type: string;
        brand: string;
        last4: string;
        expMonth?: number | null;
        expYear?: number | null;
        holderName?: string | null;
        nickname?: string | null;
        isDefault: boolean;
      }>
    >("/store/me/payment-methods"),

  /** Opens mock/Paystack checkout for ₦50 auth (refunded); card saved on success. */
  addPaymentMethod: (returnUrl?: string) =>
    apiRequest<{
      reference: string;
      amount: number;
      status: string;
      authorizationUrl?: string | null;
      accessCode?: string | null;
      provider?: string;
    }>("/store/me/payment-methods", {
      method: "POST",
      body: { returnUrl: returnUrl ?? null },
      idempotencyKey: `pm_${crypto.randomUUID()}`,
    }),

  updatePaymentMethod: (id: string, body: { nickname?: string | null; isDefault?: boolean }) =>
    apiRequest(`/store/me/payment-methods/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    }),

  removePaymentMethod: (id: string) =>
    apiRequest(`/store/me/payment-methods/${encodeURIComponent(id)}`, { method: "DELETE" }),

  verifyPayment: (reference: string) =>
    apiRequest(`/store/payments/${encodeURIComponent(reference)}/verify`, { method: "POST" }),
};

export { koboToNaira, nairaToKobo };
