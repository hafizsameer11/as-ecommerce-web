import { accountApi, koboToNaira, type ApiOrderDetail } from "@/lib/api/account";
import { commerceApi } from "@/lib/api/commerce";
import type { OrderStatus } from "@/components/account/ordersData";
import type { PlacedOrder } from "@/lib/orders-store";
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout-store";

export type ConfirmationOrder = PlacedOrder & { paymentStatus?: string };

function normalizeStatus(s: string): OrderStatus {
  const key = s.toLowerCase();
  if (key.includes("ship")) return "Shipped";
  if (key.includes("deliver")) return "Delivered";
  if (key.includes("cancel")) return "Cancelled";
  if (key.includes("return")) return "Returned";
  return "Processing";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function mapDetail(o: ApiOrderDetail): ConfirmationOrder {
  const placed = o.date ? new Date(o.date) : new Date();
  const addr = o.address;
  const delivery: DeliveryMethod =
    o.delivery === "pickup" || o.delivery === "ship" ? o.delivery : "ship";
  const payment: PaymentMethod =
    o.payment === "paystack" || o.payment === "bank" || o.payment === "card" ? o.payment : "paystack";

  return {
    id: o.number || o.id,
    apiId: o.id,
    date: fmtDate(placed),
    status: normalizeStatus(o.status),
    paymentStatus: o.paymentStatus,
    total: koboToNaira(o.total),
    itemsCount: o.itemsCount,
    eta: o.eta ? fmtDate(new Date(o.eta)) : undefined,
    tracking: o.tracking ?? undefined,
    items: (o.items ?? []).map((i) => ({
      name: i.name,
      brand: i.brand ?? undefined,
      variant: i.variant,
      qty: i.qty,
      price: koboToNaira(i.price),
      image: i.image || "",
    })),
    subtotal: o.subtotal != null ? koboToNaira(o.subtotal) : koboToNaira(o.total),
    discount: o.discount != null ? koboToNaira(o.discount) : 0,
    couponCode: o.couponCode ?? null,
    shipping: o.shipping != null ? koboToNaira(o.shipping) : 0,
    delivery,
    payment,
    address: addr
      ? {
          fullName: String(addr.fullName || addr.recipient || ""),
          address: String(addr.line1 || addr.address || ""),
          apartment: String(addr.line2 || addr.apartment || ""),
          city: String(addr.city || ""),
          state: String(addr.state || ""),
          postal: String(addr.postalCode || addr.postal || ""),
          country: String(addr.country || "NG"),
        }
      : null,
    contact: o.contact
      ? {
          email: o.contact.email || "",
          phone: o.contact.phone || "",
          subscribe: !!o.contact.subscribe,
        }
      : null,
    placedAt: placed.getTime(),
  };
}

export async function loadConfirmationOrder(args: {
  orderNumber?: string;
  orderId?: string;
  accessToken?: string;
  reference?: string;
}): Promise<ConfirmationOrder | null> {
  let apiId = args.orderId;
  let accessToken = args.accessToken;

  if (args.reference?.trim()) {
    try {
      const verified = await commerceApi.verifyPayment(args.reference.trim());
      if (verified.order?.id) apiId = verified.order.id;
    } catch {
      // still attempt order fetch below
    }
  }

  if (accessToken?.trim()) {
    try {
      const detail = await accountApi.orderByToken(accessToken.trim());
      return mapDetail(detail);
    } catch {
      // fall through
    }
  }

  if (apiId?.trim()) {
    try {
      const detail = await accountApi.myOrder(apiId.trim());
      return mapDetail(detail);
    } catch {
      // fall through
    }
  }

  if (args.orderNumber?.trim()) {
    try {
      const detail = await accountApi.myOrder(args.orderNumber.trim());
      return mapDetail(detail);
    } catch {
      return null;
    }
  }

  return null;
}

export function confirmationPaymentCopy(paymentStatus?: string) {
  const ps = (paymentStatus || "").toLowerCase();
  if (ps === "paid" || ps === "success" || ps === "completed") {
    return {
      badge: "Complete",
      title: "Thank You, Your Order is Complete!",
      subtitle: "We've received your order and it's now being processed. You will receive an email confirmation shortly.",
      amountLabel: "Total Paid",
      stepComplete: true,
    };
  }
  if (ps.includes("pending") || ps === "awaiting_payment" || ps === "unpaid") {
    return {
      badge: "Payment pending",
      title: "Order received — payment pending",
      subtitle: "Complete payment to confirm your order. You will receive email updates once payment is received.",
      amountLabel: "Amount due",
      stepComplete: false,
    };
  }
  if (ps === "failed" || ps === "cancelled" || ps === "canceled") {
    return {
      badge: "Payment failed",
      title: "Payment was not completed",
      subtitle: "Your order was created but payment did not go through. You can retry payment from your order details.",
      amountLabel: "Total",
      stepComplete: false,
    };
  }
  return {
    badge: "Order placed",
    title: "Thank you for your order",
    subtitle: "We're confirming your payment status. You'll receive an email update shortly.",
    amountLabel: "Total",
    stepComplete: false,
  };
}
