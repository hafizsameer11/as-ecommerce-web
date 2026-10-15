import { Package, Truck, MapPin, CheckCircle2 } from "lucide-react";
import type { Order } from "./ordersData";

export function OrderProgressTimeline({ order }: { order: Order }) {
  const shipped = order.status === "Shipped" || order.status === "Delivered";
  const steps = [
    { id: "placed", label: "Order Placed", desc: order.date, Icon: Package, done: true },
    { id: "processing", label: "Processing", desc: "Preparing your items", Icon: Package, done: true },
    { id: "shipped", label: "Shipped", desc: order.tracking ? `Tracking number: ${order.tracking}` : "Awaiting dispatch", Icon: Truck, done: shipped },
    { id: "transit", label: "In Transit", desc: order.eta ? `Expected Delivery: ${order.eta}` : "En route", Icon: MapPin, done: shipped },
    { id: "delivered", label: "Delivered", desc: order.status === "Delivered" ? "Successfully delivered" : "Pending", Icon: CheckCircle2, done: order.status === "Delivered" },
  ];

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${step.done ? "bg-ink text-paper" : "bg-muted text-muted-foreground"}`}>
              <step.Icon className="h-4 w-4" />
            </div>
            {index < steps.length - 1 && <div className={`w-0.5 flex-1 ${step.done ? "bg-ink" : "bg-border"}`} />}
          </div>
          <div className="min-h-[3.25rem] flex-1 pb-4">
            <div className={`text-[13px] font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</div>
            <div className="text-[11px] text-muted-foreground">{step.desc}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}