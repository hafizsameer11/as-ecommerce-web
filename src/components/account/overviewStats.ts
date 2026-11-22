import { useAllOrders } from "@/lib/orders-store";
import { useWishlistCount } from "@/lib/wishlist";
import { useNotifications } from "./notificationsData";

/** Live counts for the account overview (orders, wishlist, notifications). */
export function useAccountOverviewStats() {
  const orders = useAllOrders();
  const wishlistCount = useWishlistCount();
  const unreadCount = useNotifications((s) => s.unreadCount);
  const active = orders.filter((o) => o.status === "Processing" || o.status === "Shipped");
  const inTransit = active.filter((o) => o.status === "Shipped").length;
  return {
    activeOrders: active.length,
    inTransit,
    wishlistCount,
    unreadCount,
    activeOrdersHint: active.length === 0 ? "No active orders" : inTransit > 0 ? `${inTransit} in transit` : "Being prepared",
  };
}
