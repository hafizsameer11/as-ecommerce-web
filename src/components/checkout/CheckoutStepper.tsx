import { ShoppingCart, User, CreditCard, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { CHECKOUT_STEPS } from "./checkoutData";

const icons = [ShoppingCart, User, CreditCard, ClipboardCheck, CheckCircle2];

export function CheckoutStepper({ current, showPlace = false }: { current: 1 | 2 | 3 | 4 | 5; showPlace?: boolean }) {
  const steps = showPlace
    ? [...CHECKOUT_STEPS, { id: 5, label: "Place Order" } as any]
    : CHECKOUT_STEPS;

  return (
    <div className="w-full">
      <div className="relative flex items-start justify-between">
        {/* Connecting line background */}
        <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-border -translate-y-1/2" />
        {/* Active progress line */}
        <div
          className="absolute top-[22px] left-0 h-[2px] bg-ink -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s, i) => {
          const done = s.id < current;
          const active = s.id === current;
          const Icon = icons[i];
          return (
            <div key={s.id} className="relative flex flex-col items-center z-10 flex-1 px-1">
              <div
                className={`h-11 w-11 rounded-full border-2 grid place-items-center transition-colors duration-300 bg-white ${
                  done || active
                    ? "border-ink text-ink"
                    : "border-black/20 text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <span
                className={`mt-2 text-center text-[10px] md:text-[11px] font-semibold leading-tight ${
                  done || active ? "text-ink" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
