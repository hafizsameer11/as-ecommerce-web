import { motion } from "framer-motion";
import { Truck, Headphones } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { RosetteCheckIcon, ShieldLockIcon } from "./TrustIcons";

const items = [
  { Icon: Truck, title: "Fast Delivery", sub: "2 - 5 working days" },
  { Icon: ShieldLockIcon, title: "Secure Payments", sub: "Protected with trusted payment technology" },
  { Icon: RosetteCheckIcon, title: "Authentic Guaranteed", sub: "Every item is carefully sourced and verified" },
  { Icon: Headphones, title: "Customer Support", sub: "We're here to help" },
];

export function TrustBadges() {
  return (
    <div className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1600px]">
      {/* Mobile: 4 across, icon on top, title only (hidden on mobile, preserved for later) */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden"
        >
          {items.map(({ Icon, title }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="flex flex-col items-center gap-1.5 px-1 py-2.5 text-center"
            >
              <Icon className="h-6 w-6 text-foreground" strokeWidth={1.4} />
              <div className="text-[9px] font-semibold tracking-wider uppercase leading-tight whitespace-pre-line">
                {title}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Small desktop / tablet landscape: 4 across, icon on top, title + sub */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden md:grid lg:hidden grid-cols-4 gap-px bg-border"
        >
          {items.map(({ Icon, title, sub }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="flex flex-col items-center gap-1 bg-card px-1.5 py-3.5 text-center"
            >
              <Icon className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
              <div>
                <div className="text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap">
                  {title}
                </div>
                <div className="text-[9px] text-muted-foreground whitespace-nowrap">{sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Large desktop: 4 across, icon left */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden lg:grid grid-cols-4 gap-px bg-border"
        >
          {items.map(({ Icon, title, sub }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              whileHover={{ y: -2, backgroundColor: "oklch(0.98 0 0)" }}
              className="flex items-center gap-2 bg-card px-2.5 py-4"
            >
              <Icon className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap">
                  {title}
                </div>
                <div className="text-[9px] text-muted-foreground whitespace-nowrap">{sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
