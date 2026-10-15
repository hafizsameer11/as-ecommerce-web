import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCustomers } from "@/lib/customers-store";

export type AddressType = "shipping" | "billing" | "pickup";

export type Address = {
  id: string;
  customerId: string;
  customerName: string;
  label: string;
  type: AddressType;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  verified: boolean;
  flagged: boolean;
  ordersShipped: number;
  lastUsedAt: string;
  createdAt: string;
  notes?: string;
};

const STREETS = ["Kingsway", "Bourdillon", "Awolowo", "Admiralty Way", "Ozumba Mbadiwe", "Adeola Odeku", "Alfred Rewane", "Glover", "Bishop Oluwole", "Ligali Ayorinde"];
const uid = () => Math.random().toString(36).slice(2, 9);

function seed(): Address[] {
  const customers = useCustomers.getState().customers;
  if (!customers.length) return [];
  const out: Address[] = [];
  customers.forEach((c, i) => {
    const count = 1 + (i % 3);
    for (let k = 0; k < count; k++) {
      const type: AddressType = k === 0 ? "shipping" : k === 1 ? "billing" : "pickup";
      const street = STREETS[(i + k) % STREETS.length];
      out.push({
        id: `adr_${uid()}`,
        customerId: c.id,
        customerName: c.name,
        label: k === 0 ? "Home" : k === 1 ? "Office" : "Warehouse",
        type,
        recipient: c.name,
        phone: c.phone,
        line1: `${5 + i + k * 3} ${street} Street`,
        line2: k === 1 ? "Suite 4B" : undefined,
        city: c.city,
        state: c.city,
        country: c.country,
        postalCode: `${100000 + i * 137 + k * 11}`.slice(0, 6),
        isDefault: k === 0,
        verified: (i + k) % 5 !== 0,
        flagged: (i + k) % 23 === 0,
        ordersShipped: k === 0 ? c.orders : Math.floor(c.orders / 3),
        lastUsedAt: c.lastOrderAt,
        createdAt: c.createdAt,
      });
    }
  });
  return out;
}

type State = {
  addresses: Address[];
  update: (id: string, patch: Partial<Address>) => void;
  toggleVerified: (id: string) => void;
  toggleFlag: (id: string) => void;
  setDefault: (customerId: string, id: string) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useAddresses = create<State>()(
  persist(
    (set) => ({
      addresses: seed(),
      update: (id, patch) => set((s) => ({ addresses: s.addresses.map((a) => a.id === id ? { ...a, ...patch } : a) })),
      toggleVerified: (id) => set((s) => ({ addresses: s.addresses.map((a) => a.id === id ? { ...a, verified: !a.verified } : a) })),
      toggleFlag: (id) => set((s) => ({ addresses: s.addresses.map((a) => a.id === id ? { ...a, flagged: !a.flagged } : a) })),
      setDefault: (customerId, id) => set((s) => ({
        addresses: s.addresses.map((a) => a.customerId === customerId ? { ...a, isDefault: a.id === id } : a),
      })),
      remove: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      reset: () => set({ addresses: seed() }),
    }),
    { name: "asl-admin-addresses-v1" }
  )
);
