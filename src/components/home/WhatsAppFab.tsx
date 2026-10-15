import { motion } from "framer-motion";
import { goToLabel } from "@/lib/nav-resolve";

export function WhatsAppFab() {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08, boxShadow: "0 12px 30px rgba(37, 211, 102, 0.3)" }}
      whileTap={{ scale: 0.95 }}
      onClick={() => goToLabel("Opening WhatsApp")}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] shadow-lg"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.716.315-.53.573-1.032 1.36-1.032 2.19 0 .243.028.487.086.717.257 1.09.856 2.007 1.575 2.87 1.31 1.582 2.874 2.673 4.778 3.324.472.16.966.293 1.462.4a2.75 2.75 0 0 0 .84.058c.688-.03 1.62-.418 1.936-1.09.13-.28.187-.573.087-.86-.257-.717-1.732-1.117-2.375-1.234z"/>
        <path d="M16.003 0C7.164 0 0 7.164 0 16c0 2.756.706 5.395 2.045 7.75L.058 31.293a.5.5 0 0 0 .625.61l7.688-2.017A15.94 15.94 0 0 0 16.003 32C24.842 32 32 24.836 32 16S24.842 0 16.003 0zm0 29.335a13.29 13.29 0 0 1-6.996-1.99.5.5 0 0 0-.386-.058l-5.79 1.518 1.55-5.66a.5.5 0 0 0-.058-.386 13.28 13.28 0 0 1-2.02-7.02c0-7.35 5.99-13.34 13.34-13.34S29.34 8.65 29.34 16 23.35 29.335 16.003 29.335z"/>
      </svg>
    </motion.button>
  );
}
