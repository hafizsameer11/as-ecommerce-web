import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { buttonTap } from "@/lib/motion";

type PromoBannerProps = {
  tag?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaTo?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
  image: string;
};

export function PromoBanner({
  tag = "Exclusive",
  title,
  subtitle,
  ctaLabel = "Shop Now",
  ctaTo = "/shop",
  secondaryCtaLabel,
  secondaryCtaTo,
  image,
}: PromoBannerProps) {
  return (
    <section className="px-3 py-5 md:px-0 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="group relative overflow-hidden rounded-xl bg-ink shadow-[0_14px_40px_-20px_rgba(0,0,0,0.55)] md:rounded-none"
      >
        <div className="relative aspect-square md:aspect-auto md:h-[360px] lg:h-[420px]">
          <motion.img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top md:object-right"
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* legibility scrim - vertical on square mobile, horizontal on wide desktop */}
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/80 via-40% to-transparent to-75% md:bg-linear-to-r md:from-ink md:via-ink/90 md:via-45% md:to-transparent md:to-65%" />

          <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-6 pt-6 md:max-w-[54%] md:justify-center md:px-16 md:py-10">
            <div className="flex items-center gap-2.5 md:gap-3.5">
              <span className="h-px w-6 bg-gold/70 md:w-10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold md:text-[11px]">
                {tag}
              </span>
            </div>

            <h2 className="mt-3 font-display text-[30px] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-paper whitespace-pre-line md:mt-5 md:text-[50px] lg:text-[60px]">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-2.5 max-w-[38ch] text-[12px] leading-relaxed text-paper/70 md:mt-4 md:max-w-md md:text-[15px]">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-5 flex flex-nowrap items-center gap-2.5 md:mt-8 md:flex-wrap md:gap-3">
              <motion.div {...buttonTap} className="shrink-0">
                <Link
                  to={ctaTo}
                  className="inline-flex items-center bg-gold px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-paper transition-colors duration-300 hover:bg-gold/90 md:px-8 md:py-3.5 md:text-[12px]"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
              {secondaryCtaLabel && secondaryCtaTo ? (
                <motion.div {...buttonTap} className="shrink-0">
                  <Link
                    to={secondaryCtaTo}
                    className="inline-flex items-center border border-paper/70 bg-ink/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-paper transition-colors duration-300 hover:bg-paper hover:text-ink md:px-8 md:py-3.5 md:text-[12px]"
                  >
                    {secondaryCtaLabel}
                  </Link>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
