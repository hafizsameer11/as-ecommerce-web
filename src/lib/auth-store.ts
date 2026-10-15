import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiError, loadTokens, saveTokens } from "@/lib/api/client";
import { storeAuthApi, type CustomerDto } from "@/lib/api/auth";

export type AuthMode = "signin" | "signup" | "forgot" | "otp";

export type AuthUser = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  isLoginOpen: boolean;
  loginMode: AuthMode;
  loginNext?: string;
  hydrated: boolean;
  twoFactorChallenge: string | null;
  signIn: (email: string, password?: string) => Promise<AuthUser | null>;
  completeTwoFactor: (code: string) => Promise<AuthUser>;
  cancelTwoFactor: () => void;
  register: (data: { name: string; email: string; phone?: string; password?: string }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  openLogin: (mode?: AuthMode, next?: string) => void;
  closeLogin: () => void;
  setLoginMode: (mode: AuthMode) => void;
  /** Re-validate session cookie against /store/me */
  bootstrap: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

function toAuthUser(c: CustomerDto): AuthUser {
  return {
    name: c.name || `${c.firstName} ${c.lastName}`.trim() || c.email,
    email: c.email,
    phone: c.phone ?? undefined,
    avatar: c.avatarUrl ?? undefined,
  };
}

async function clearUserPersistedStores() {
  const [{ useOrders }, { useWallet }, { useWishlist }, { useMyCoupons }, { useCheckout }, { useNotify }] =
    await Promise.all([
      import("@/lib/orders-store"),
      import("@/lib/wallet-store"),
      import("@/lib/wishlist"),
      import("@/lib/my-coupons-store"),
      import("@/lib/checkout-store"),
      import("@/lib/reviews"),
    ]);
  useOrders.setState({ orders: [], hydrated: false });
  useWallet.setState({ balance: 0, totalSpent: 0, txns: [], hydrated: false });
  useWishlist.setState({ ids: [], variations: {} });
  useMyCoupons.setState({ coupons: [] });
  useNotify.setState({ items: {} });
  useCheckout.setState({
    contact: { email: "", phone: "", subscribe: false },
    address: {
      fullName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      postal: "",
      country: "Nigeria",
    },
    delivery: "ship",
    payment: "paystack",
    coupon: null,
    discountPct: 0,
    discountAmount: 0,
    shippingAmount: 0,
  });
}

async function afterAuthMerge() {
  try {
    const [{ useCart }, { useWishlist }, { useMyCoupons }, { useOrders }, { useWallet }] =
      await Promise.all([
        import("@/lib/cart-store"),
        import("@/lib/wishlist"),
        import("@/lib/my-coupons-store"),
        import("@/lib/orders-store"),
        import("@/lib/wallet-store"),
      ]);
    await Promise.all([
      useCart.getState().mergeGuestCart(),
      useWishlist.getState().mergeLocal(),
      useMyCoupons.getState().refresh(),
      useOrders.getState().hydrate(),
      useWallet.getState().hydrate(),
    ]);
  } catch (err) {
    console.warn("[auth] post-login merge failed", err);
  }
}

function applySession(
  set: (p: Partial<AuthState>) => void,
  get: () => AuthState,
  customer: CustomerDto
): AuthUser {
  const user = toAuthUser(customer);
  set({
    user,
    isLoggedIn: true,
    twoFactorChallenge: null,
    hasOnboarded: !!customer.hasOnboarded || get().hasOnboarded,
    hydrated: true,
  });
  void afterAuthMerge();
  return user;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      hasOnboarded: false,
      isLoginOpen: false,
      loginMode: "signin",
      loginNext: undefined,
      hydrated: false,
      twoFactorChallenge: null,
      signIn: async (email, password) => {
        if (!password) throw new ApiError(400, null, "Password is required");
        const res = await storeAuthApi.login(email, password);
        if (res.twoFactorRequired) {
          if (!res.challenge) throw new ApiError(401, null, "Two-factor challenge missing");
          set({ twoFactorChallenge: res.challenge });
          return null;
        }
        return applySession(set, get, res.customer);
      },
      completeTwoFactor: async (code) => {
        const challenge = get().twoFactorChallenge;
        if (!challenge) throw new ApiError(400, null, "No sign-in in progress");
        const res = await storeAuthApi.login2fa(challenge, code.trim());
        return applySession(set, get, res.customer);
      },
      cancelTwoFactor: () => set({ twoFactorChallenge: null }),
      register: async ({ name, email, phone, password }) => {
        if (!password) throw new ApiError(400, null, "Password is required");
        const res = await storeAuthApi.register({ name, email, phone, password });
        return applySession(set, get, res.customer);
      },
      signOut: async () => {
        try {
          await storeAuthApi.logout();
        } catch {
          saveTokens(null);
        }
        await clearUserPersistedStores();
        set({ user: null, isLoggedIn: false, twoFactorChallenge: null });
      },
      completeOnboarding: () => {
        set({ hasOnboarded: true });
        void storeAuthApi.completeOnboarding().catch((err) => console.warn("[auth] onboarding", err));
      },
      openLogin: (mode = "signin", next) =>
        set({ isLoginOpen: true, loginMode: mode, loginNext: next, twoFactorChallenge: null }),
      closeLogin: () => set({ isLoginOpen: false, twoFactorChallenge: null }),
      setLoginMode: (mode) => set({ loginMode: mode }),
      bootstrap: async () => {
        try {
          const tokens = loadTokens();
          if (!tokens?.accessToken && !tokens?.refreshToken) {
            set({ user: null, isLoggedIn: false, hydrated: true, twoFactorChallenge: null });
            void import("@/lib/cart-store").then(({ useCart }) => useCart.getState().refresh());
            return;
          }
          const me = await storeAuthApi.me();
          applySession(set, get, me);
        } catch {
          saveTokens(null);
          set({ user: null, isLoggedIn: false, hydrated: true, twoFactorChallenge: null });
          void import("@/lib/cart-store").then(({ useCart }) => useCart.getState().refresh());
        }
      },
      forgotPassword: async (email) => {
        await storeAuthApi.forgotPassword(email);
      },
    }),
    {
      name: "asl-auth",
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
      }),
    }
  )
);

export const useIsLoggedIn = () => useAuth((s) => s.hydrated && s.isLoggedIn);
export const useCurrentUser = () => useAuth((s) => s.user);

/** Display name for account chrome; falls back when profile is not loaded yet. */
export const useAccountDisplayName = () =>
  useAuth((s) => s.user?.name?.trim() || "Account");

export function syncAuthUserFromCustomer(c: CustomerDto) {
  useAuth.setState({ user: toAuthUser(c) });
}
export const useLoginModal = () =>
  useAuth((s) => ({
    isOpen: s.isLoginOpen,
    mode: s.loginMode,
    next: s.loginNext,
    open: s.openLogin,
    close: s.closeLogin,
    setMode: s.setLoginMode,
  }));
