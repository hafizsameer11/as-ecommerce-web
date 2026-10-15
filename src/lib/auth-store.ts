import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiError } from "@/lib/api/client";
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
  signIn: (email: string, password?: string) => Promise<AuthUser>;
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
      signIn: async (email, password) => {
        if (!password) throw new ApiError(400, null, "Password is required");
        const res = await storeAuthApi.login(email, password);
        if ((res as { twoFactorRequired?: boolean }).twoFactorRequired) {
          throw new ApiError(401, null, "Two-factor authentication is required");
        }
        const user = toAuthUser(res.customer);
        set({
          user,
          isLoggedIn: true,
          hasOnboarded: !!res.customer.hasOnboarded || get().hasOnboarded,
        });
        void afterAuthMerge();
        return user;
      },
      register: async ({ name, email, phone, password }) => {
        if (!password) throw new ApiError(400, null, "Password is required");
        const res = await storeAuthApi.register({ name, email, phone, password });
        const user = toAuthUser(res.customer);
        set({ user, isLoggedIn: true });
        void afterAuthMerge();
        return user;
      },
      signOut: async () => {
        try {
          await storeAuthApi.logout();
        } catch {
          /* still clear local session */
        }
        set({ user: null, isLoggedIn: false });
      },
      completeOnboarding: () => set({ hasOnboarded: true }),
      openLogin: (mode = "signin", next) =>
        set({ isLoginOpen: true, loginMode: mode, loginNext: next }),
      closeLogin: () => set({ isLoginOpen: false }),
      setLoginMode: (mode) => set({ loginMode: mode }),
      bootstrap: async () => {
        try {
          const me = await storeAuthApi.me();
          set({
            user: toAuthUser(me),
            isLoggedIn: true,
            hasOnboarded: !!me.hasOnboarded || get().hasOnboarded,
            hydrated: true,
          });
          void afterAuthMerge();
        } catch {
          set({ user: null, isLoggedIn: false, hydrated: true });
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
        user: s.user,
        isLoggedIn: s.isLoggedIn,
        hasOnboarded: s.hasOnboarded,
      }),
    }
  )
);

export const useIsLoggedIn = () => useAuth((s) => s.isLoggedIn);
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
