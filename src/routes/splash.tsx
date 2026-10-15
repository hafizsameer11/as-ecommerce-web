import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-store";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import emblem from "@/assets/ASL_emblem_orange_stroke.png";
import wordmark from "@/assets/ASL_wordmark_white.png";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "ASL ORIGINALS" },
      { name: "description", content: "Premium style. Original always." },
      { property: "og:title", content: "ASL ORIGINALS" },
      { property: "og:description", content: "Premium style. Original always." },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const hasOnboarded = useAuth((s) => s.hasOnboarded);
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const openLogin = useAuth((s) => s.openLogin);

  useEffect(() => {
    if (isDesktop) {
      navigate({ to: "/", replace: true });
      return;
    }
    const t = setTimeout(() => {
      if (isLoggedIn) navigate({ to: "/", replace: true });
      else if (!hasOnboarded) navigate({ to: "/onboarding", replace: true });
      else {
        navigate({ to: "/", replace: true });
        openLogin("signin", "/");
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [isDesktop, hasOnboarded, isLoggedIn, navigate, openLogin]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex flex-col items-center justify-center">
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={emblem}
          alt=""
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-36 w-auto object-contain brightness-0 invert"
        />

        <motion.img
          src={wordmark}
          alt="ASL ORIGINALS"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-7 w-auto max-w-[260px] object-contain mt-2"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-1 text-[11px] leading-none tracking-[0.12em] text-white/60 whitespace-nowrap"
        >
          …where luxury rises and brilliance shines.
        </motion.p>
      </motion.div>
    </div>
  );
}
