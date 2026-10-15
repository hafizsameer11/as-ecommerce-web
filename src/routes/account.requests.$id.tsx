import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ConciergeRequestDetail } from "@/components/account/ConciergeRequestDetail";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/account/requests/$id")({
  head: () => ({ meta: [{ title: "Request details - ASL ORIGINALS" }] }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = Route.useParams();
  const isDesktop = useIsDesktop();

  const body = (
    <>
      <Link to="/account/requests" className="text-[12px] font-semibold underline mb-4 inline-block">
        ← Back to requests
      </Link>
      <ConciergeRequestDetail id={id} />
      <Toaster position="top-center" />
    </>
  );

  if (isDesktop) {
    return (
      <DesktopShell active="Account">
        <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
          <AccountSidebar activeId="requests" />
          <div>{body}</div>
        </div>
      </DesktopShell>
    );
  }

  return (
    <MobileShell activeBottom="account" headerVariant="shop" showTopTabs={false} title="Request details">
      <div className="px-4 py-4">{body}</div>
    </MobileShell>
  );
}
