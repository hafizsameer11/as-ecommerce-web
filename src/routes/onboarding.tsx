import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import slide1 from "@/assets/onboard-1.jpg";
import wordmarkWhite from "@/assets/ASL_wordmark_white.png";
import slide2 from "@/assets/onboard-2.jpg";
import slide3 from "@/assets/onboard-3.jpg";
import slide4 from "@/assets/onboard-4.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to ASL ORIGINALS" },
      { name: "description", content: "A quick tour of ASL ORIGINALS - luxury style, sourced and delivered." },
      { property: "og:title", content: "Welcome to ASL ORIGINALS" },
      { property: "og:description", content: "A quick tour of ASL ORIGINALS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const slides = [
  {
    image: slide1,
    kicker: "VOL. 01 • CURATED",
    title: "THE WORLD, CURATED.",
    body: "The world’s most coveted fashion, footwear, fragrances and accessories, authentically sourced through trusted retailers, official brand stores and verified suppliers worldwide.",
    extra: "Discover a considered selection of the brands and pieces that define modern style.",
    cta: "EXPLORE THE COLLECTION",
  },
  {
    image: slide2,
    kicker: "VOL. 02 • CONCIERGE",
    title: "CONSIDER IT FOUND.",
    body: "From hard to find pieces to exclusive requests, our concierge service is here to source what you are looking for through our trusted network.",
    cta: "REQUEST CONCIERGE",
  },
  {
    image: slide3,
    kicker: "VOL. 03 • DELIVERED",
    title: "FROM OUR HANDS TO YOURS.",
    body: "Every order is carefully prepared, thoughtfully packaged and securely delivered, because the experience should be just as considered as the piece itself.",
    cta: "THE ASL ORIGINALS EXPERIENCE",
  },
  {
    image: slide4,
    kicker: "VOL. 04 • MEMBERSHIP",
    title: "REWARDS, REDEFINED.",
    body: "Every purchase brings you closer to more. Earn points, unlock exclusive rewards and enjoy carefully selected benefits designed for our members.",
    cta: "DISCOVER ASL ORIGINALS MEMBERSHIP",
  },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const complete = useAuth((s) => s.completeOnboarding);
  const openLogin = useAuth((s) => s.openLogin);
  const [i, setI] = useState(0);
  const s = slides[i];
  const isLast = i === slides.length - 1;
  const done = () => {
    complete();
    navigate({ to: "/", replace: true });
    openLogin("signup", "/");
  };
  const next = () => (isLast ? done() : setI(i + 1));

  // Circular progress ring
  const R = 30;
  const C = 2 * Math.PI * R;
  const progress = ((i + 1) / slides.length) * C;

  return (
    <div className="fixed inset-0 bg-[#0b0b0b] text-white overflow-y-auto flex flex-col">
      {/* TOP: Image region */}
      <div className="relative min-h-44 flex-1 w-full overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={`img-${i}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ opacity: { duration: 0.7 }, scale: { duration: 6, ease: "linear" } }}
          >
            <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* Top subtle darken for header legibility */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-40"
              style={{ background: "linear-gradient(180deg, rgba(11,11,11,0.65) 0%, rgba(11,11,11,0) 100%)" }}
            />
            {/* Bottom fade INTO the dark text area */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-72"
              style={{ background: "linear-gradient(180deg, rgba(11,11,11,0) 0%, rgba(11,11,11,0.45) 40%, #0b0b0b 90%)" }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Grain over image only */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Header on top of image */}
        <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-6 pt-6">
          <div className="flex flex-col">
            <img src={wordmarkWhite} alt="ASL ORIGINALS" className="h-[17px] w-auto object-contain" />
          </div>
          <button
            onClick={done}
            className="text-[11px] uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors pt-1"
          >
            Skip
          </button>
        </header>
      </div>

      {/* BOTTOM: Solid dark text area */}
      <div className="relative shrink-0 bg-[#0b0b0b] px-6 pt-2 pb-8 flex flex-col justify-end">



          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-3">
                {s.kicker}
              </div>
              <h1 className="font-display text-[38px] leading-[1.02] font-bold tracking-tight whitespace-pre-line">
                {s.title}
              </h1>
              <p className="mt-5 text-[14px] leading-relaxed text-white/70 max-w-[92%]">
                {s.body}
              </p>
              {s.extra && <p className="mt-3 text-[14px] leading-relaxed text-white/70 max-w-[92%]">{s.extra}</p>}
            </motion.div>
          </AnimatePresence>

          {/* CTA row: dot indicators + circular next */}
          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className="group relative h-8 flex items-center"
                >
                  <span
                    className={`block h-[2px] transition-all duration-500 ${
                      idx === i ? "w-10 bg-gold" : "w-5 bg-white/25 group-hover:bg-white/45"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={next}
              className="h-auto min-h-[72px] max-w-[70%] p-0 gap-3 text-primary-foreground hover:bg-transparent hover:text-primary-foreground [&_svg]:size-auto group"
              aria-label={s.cta}
            >
              <span className="whitespace-normal text-right text-[10px] leading-relaxed">{s.cta}</span>
              <span className="relative h-[72px] w-[72px] shrink-0 grid place-items-center">
              {/* progress ring */}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={R} stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" fill="none" />
                <motion.circle
                  cx="36"
                  cy="36"
                  r={R}
                  stroke="#d4a24a"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  animate={{ strokeDashoffset: C - progress }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <span className="h-14 w-14 rounded-full bg-gold grid place-items-center transition-transform group-active:scale-95">
                <ArrowRight className="h-5 w-5 text-[#0b0b0b]" strokeWidth={2.25} />
              </span>
              </span>
            </Button>
          </div>

          {/* footer link */}
          <div className="mt-8 text-center text-[12px] text-white/50">
            Already a member?{" "}
            <button
              onClick={() => openLogin("signin", "/")}
              className="text-white/90 underline underline-offset-4 decoration-gold"
            >
              Sign in
            </button>
          </div>
      </div>
    </div>

  );
}
