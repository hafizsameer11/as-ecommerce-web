import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileHome } from "@/components/home/MobileHome";
import { DesktopHome } from "@/components/home/DesktopHome";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isDesktop) {
      setReady(true);
      return;
    }
    const seen = sessionStorage.getItem("asl-splash-seen");
    if (!seen) {
      sessionStorage.setItem("asl-splash-seen", "1");
      navigate({ to: "/splash", replace: true });
      return;
    }
    setReady(true);
  }, [isDesktop, navigate]);

  if (!ready && !isDesktop) return null;

  return (
    <>
      {isDesktop ? <DesktopHome /> : <MobileHome />}
      <Toaster position="top-center" />
    </>
  );
}
