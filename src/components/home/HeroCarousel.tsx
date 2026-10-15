import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides } from "@/lib/mock-data";
import { buttonTap } from "@/lib/motion";
import { Link } from "@tanstack/react-router";

export function HeroCarousel({ compact = false, fullScreen = false }: { compact?: boolean; fullScreen?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % heroSlides.length), 5500);
    return () => clearInterval(id);
  }, []);
  const slide = heroSlides[i];

  return (
    <div
      className={`relative overflow-hidden bg-ink ${
        fullScreen
          ? "aspect-square md:aspect-auto md:h-[70vh] rounded-none"
          : compact
            ? "h-[230px] md:h-[320px] rounded-xl"
            : "h-[420px] md:h-[560px] rounded-xl"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            initial={{ scale: 1 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: 7, ease: "linear" }}
            src={slide.image}
            alt=""
            className={`h-full w-full object-cover ${fullScreen ? "object-center" : "object-right"}`}
          />
          <div
            className={`absolute inset-0 ${
              fullScreen
                ? "bg-linear-to-t from-ink via-ink/45 via-40% to-ink/10"
                : `bg-linear-to-r from-ink via-ink/90 via-45% to-transparent ${compact ? "to-65%" : "to-55%"}`
            }`}
          />

        </motion.div>
      </AnimatePresence>

      <div
        className={`relative z-10 flex h-full flex-col justify-center ${
          fullScreen
            ? "px-5 md:px-16 max-w-[85%] md:max-w-2xl justify-end pb-20 md:pb-24"
            : compact
              ? "px-4 max-w-[62%]"
              : "px-4 md:px-16 max-w-2xl"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className={`font-semibold tracking-[0.22em] text-gold ${
                fullScreen
                  ? "text-xs md:text-sm mb-4"
                  : compact
                    ? "text-[10px] mb-2"
                    : "text-xs mb-3 md:text-sm"
              }`}
            >
              {slide.tag}
            </div>
            <h1
              className={`font-display font-bold uppercase leading-[1.05] tracking-[-0.02em] text-paper whitespace-pre-line ${
                fullScreen
                  ? "text-4xl md:text-6xl"
                  : compact
                    ? "text-[22px]"
                    : "text-4xl md:text-6xl"
              }`}
            >
              {slide.title}
            </h1>
            <div className={`flex flex-nowrap items-center gap-3 ${fullScreen ? "mt-8" : compact ? "mt-4" : "mt-6"}`}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap="tap"
                variants={buttonTap}
                className="inline-block"
              >
                <Link
                  to="/shop"
                  className={`inline-block whitespace-nowrap bg-gold text-paper font-semibold uppercase tracking-[0.18em] ${
                    fullScreen
                      ? "px-5 md:px-6 py-3 text-xs"
                      : compact
                        ? "px-3 py-2 text-[9px]"
                        : "px-6 py-3 text-xs"
                  }`}
                >
                  Shop Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap="tap"
                variants={buttonTap}
                className="inline-block"
              >
                <Link
                  to="/new-arrivals"
                  className={`inline-block whitespace-nowrap bg-ink/60 border border-paper/70 text-paper font-semibold uppercase tracking-[0.18em] ${
                    fullScreen
                      ? "px-5 md:px-6 py-3 text-xs"
                      : compact
                        ? "px-3 py-2 text-[9px]"
                        : "px-6 py-3 text-xs"
                  }`}
                >
                  New Arrivals
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {heroSlides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            whileTap="tap"
            variants={buttonTap}
            animate={{ width: idx === i ? 32 : 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`h-2 rounded-full ${idx === i ? "bg-paper" : "bg-paper/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
