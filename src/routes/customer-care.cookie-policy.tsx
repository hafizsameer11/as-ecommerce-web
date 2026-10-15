import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { HelpCircle, BarChart3, Settings2, Megaphone, ListChecks, Building2, Pencil, Phone, Mail, MapPin, Cookie } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy - ASL ORIGINALS" },
      { name: "description", content: "How ASL ORIGINALS uses cookies and similar technologies." },
    ],
  }),
  component: CookiePolicy,
});

const cookieTypes = [
  { Icon: ListChecks, title: "Essential Cookies", body: "These cookies are necessary for the website to function properly and cannot be disabled." },
  { Icon: BarChart3, title: "Performance Cookies", body: "These cookies help us understand how visitors use our website so we can improve its performance." },
  { Icon: Settings2, title: "Functional Cookies", body: "These cookies enable the website to remember your preferences and provide enhanced features." },
  { Icon: Megaphone, title: "Advertising Cookies", body: "These cookies are used to deliver relevant ads and measure the effectiveness of our marketing campaigns." },
];

const sections = [
  { Icon: HelpCircle, title: "1. What Are Cookies?", body: "Cookies are small text files that are placed on your device when you visit a website. They help websites function properly, improve your experience, and provide information to the site owners." },
  { Icon: Cookie, title: "2. How We Use Cookies", body: "ASL ORIGINALS uses cookies for the following purposes:", children: cookieTypes },
  { Icon: ListChecks, title: "3. Your Choices", body: "You can choose to accept, reject, or manage cookies at any time. You can update your cookie preferences through our Cookie Settings panel on the website. Please note that disabling certain cookies may affect the functionality of the website." },
  { Icon: Building2, title: "4. Third-Party Cookies", body: "We may allow trusted third-party services to place cookies on your device to help us analyse website traffic, serve ads, and improve your overall experience. These third parties have their own privacy policies, and we encourage you to review them." },
  { Icon: Pencil, title: "5. Updates to This Policy", body: "We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our business operations. Any updates will be posted on this page with the revised effective date." },
  { Icon: Phone, title: "6. Contact Us", body: "If you have any questions about this Cookie Policy, please contact us." },
];

function CookiePolicy() {
  const [accepted, setAccepted] = useState(false);
  return (
    <CustomerCareScaffold
      activeId="cookie-policy"
      title="Cookie Policy"
      subtitle="This Cookie Policy explains how ASL ORIGINALS uses cookies and similar technologies when you visit our website."
    >
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.title} className="flex gap-4">
            <div className="shrink-0 h-9 w-9 rounded-full bg-muted grid place-items-center">
              <s.Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[13.5px] text-ink">{s.title}</h3>
              <p className="mt-1 text-[12.5px] text-foreground/75 leading-relaxed">{s.body}</p>
              {s.children && (
                <div className="mt-3 space-y-3">
                  {s.children.map((c) => (
                    <div key={c.title} className="flex gap-3">
                      <div className="h-8 w-8 rounded bg-muted grid place-items-center shrink-0">
                        <c.Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-semibold text-[12.5px] text-ink">{c.title}</div>
                        <div className="text-[12px] text-foreground/70 leading-relaxed">{c.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Row Icon={Mail} label="Email" value="customerservice@asloriginals.com" />
        <Row Icon={Phone} label="Phone / WhatsApp" value="+234 810 123 4567" />
        <Row Icon={MapPin} label="Address" value="Lekki Phase 1, Lagos, Nigeria" />
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Cookie className="h-5 w-5 text-ink shrink-0" strokeWidth={1.75} />
          <div className="text-[12.5px] text-foreground/80">
            <div className="font-semibold text-ink">Cookie Consent</div>
            By continuing to browse or by clicking "Accept All Cookies", you agree to the use of cookies on our website as described in this policy.
          </div>
        </div>
        <button
          onClick={() => {
            setAccepted(true);
            toast.success("Cookie preferences saved.");
          }}
          className="inline-flex items-center justify-center h-10 px-5 rounded bg-ink text-white text-[12.5px] font-semibold whitespace-nowrap"
        >
          {accepted ? "Preferences Saved" : "Accept All Cookies"}
        </button>
      </div>
    </CustomerCareScaffold>
  );
}

function Row({ Icon, label, value }: { Icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
        <div className="text-[12.5px] mt-0.5 text-ink">{value}</div>
      </div>
    </div>
  );
}
