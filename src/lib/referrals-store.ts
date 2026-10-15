import { create } from "zustand";
import { loyaltyApi, koboToNaira, type MyReferrals } from "@/lib/api/loyalty";

export type ReferralFriend = {
  name: string;
  status: string;
  reward: string;
};

export type ReferralsState = {
  enabled: boolean;
  code: string;
  link: string;
  headline: string;
  subhead: string;
  stats: { invited: number; joined: number; earned: number; clicks: number; pending: number };
  friends: ReferralFriend[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

function formatReward(reward?: number | null) {
  if (reward == null || reward === 0) return " - ";
  return `₦${koboToNaira(reward).toLocaleString("en-NG")}`;
}

function mapFriends(data: MyReferrals): ReferralFriend[] {
  return (data.friends ?? []).map((f) => ({
    name: f.name || f.email || "Friend",
    status: f.status === "rewarded" || f.status === "qualified" ? "Joined" : "Pending",
    reward: formatReward(f.reward),
  }));
}

export const useMyReferrals = create<ReferralsState>()((set) => ({
  enabled: true,
  code: "",
  link: "",
  headline: "Share ASL. Earn credits.",
  subhead: "Invite friends and earn rewards for every signup.",
  stats: { invited: 0, joined: 0, earned: 0, clicks: 0, pending: 0 },
  friends: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const data = await loyaltyApi.myReferrals();
      set({
        enabled: data.enabled,
        code: data.code,
        link: data.link,
        headline: data.headline || "Share ASL. Earn credits.",
        subhead: data.subhead || data.advocateReward?.label || "Invite friends and earn rewards.",
        stats: {
          invited: data.stats?.invited ?? 0,
          joined: data.stats?.joined ?? 0,
          earned: koboToNaira(data.stats?.earned ?? 0),
          clicks: data.stats?.clicks ?? 0,
          pending: data.stats?.pending ?? 0,
        },
        friends: mapFriends(data),
        hydrated: true,
      });
    } catch (err) {
      console.warn("[referrals] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));
