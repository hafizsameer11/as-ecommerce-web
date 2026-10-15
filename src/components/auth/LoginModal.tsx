import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { AuthPanel } from "./AuthForms";

export function LoginModal() {
  const isOpen = useAuth((s) => s.isLoginOpen);
  const close = useAuth((s) => s.closeLogin);
  const mode = useAuth((s) => s.loginMode);
  const next = useAuth((s) => s.loginNext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted, close]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 md:p-8 shadow-2xl"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 md:right-5 md:top-5 h-8 w-8 rounded-full bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <AuthPanel onDone={close} initialMode={mode} initialEmail={undefined} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
