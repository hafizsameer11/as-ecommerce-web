import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { buttonTap } from "@/lib/motion";
import salesHeroAsset from "@/assets/sales-hero.png";

export function SalesHero({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative w-full rounded-xl overflow-hidden ${compact ? "h-[170px]" : "h-[260px]"}`}>
      {/* Background image with dark blended backdrop */}
      <img
        src={salesHeroAsset}
        alt="Sales hero"
        width={1600}
        height={512}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Subtle left gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      {/* Copy */}
      <div className={`relative h-full flex flex-col justify-center ${compact ? "px-4 max-w-[60%]" : "px-8 md:px-10 max-w-[55%]"}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`inline-block text-sale font-display font-bold uppercase tracking-widest ${compact ? "text-xs" : "text-sm"}`}>
            SALES
          </div>
          <h1 className={`mt-1 font-display font-bold text-white uppercase tracking-wider leading-none ${compact ? "text-[20px]" : "text-3xl md:text-4xl"}`}>
            BIG STYLES.
          </h1>
          <h1 className={`font-display font-bold text-white uppercase tracking-wider leading-none ${compact ? "text-[20px]" : "text-3xl md:text-4xl"}`}>
            BETTER PRICES.
          </h1>
          <p className={`text-white/80 leading-snug ${compact ? "text-[10px] mt-2 max-w-[90%]" : "text-[13px] mt-3 max-w-[85%]"}`}>
            Enjoy up to 50% off on your favorite items.
          </p>
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            className={`mt-3 bg-white text-ink font-bold uppercase tracking-widest rounded-[3px] flex items-center gap-2 ${compact ? "text-[10px] px-3 py-2" : "text-[11px] px-5 py-2.5"}`}
          >
            <ShoppingBag className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            Shop All Sales
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
