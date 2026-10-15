import { createFileRoute } from "@tanstack/react-router";
import { User, Lock, Share2, ShieldCheck, UserCheck, Cookie, Link2, Baby, Pencil, Phone, Mail, MapPin } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - ASL ORIGINALS" },
      { name: "description", content: "How ASL ORIGINALS collects, uses, protects, and shares your information." },
    ],
  }),
  component: PrivacyPolicy,
});

const sections = [
  { Icon: User, title: "1. Information We Collect", body: "We collect information you provide directly to us, such as your name, email address, phone number, shipping address, billing information, and order details. We also collect certain information automatically, including device information, browser type, IP address, and browsing activity on our website." },
  { Icon: Lock, title: "2. How We Use Your Information", body: "We use your information to process orders, provide customer support, personalize your shopping experience, improve our website and services, send important updates, and communicate promotional offers you may be interested in." },
  { Icon: Share2, title: "3. Information Sharing and Disclosure", body: "We do not sell or rent your personal information. We may share your information with trusted third parties who help us operate our website, process payments, deliver orders, and provide customer support. These partners are obligated to keep your information secure." },
  { Icon: ShieldCheck, title: "4. Data Security", body: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. While we strive to protect your data, no online system is completely secure." },
  { Icon: UserCheck, title: "5. Your Rights and Choices", body: "You have the right to access, update, or delete your personal information. You can also opt out of promotional communications at any time. To exercise your rights, please contact us using the information provided below." },
  { Icon: Cookie, title: "6. Cookies and Tracking Technologies", body: "We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences in your browser settings. For more details, please see our Cookie Policy." },
  { Icon: Link2, title: "7. Third-Party Links", body: "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies." },
  { Icon: Baby, title: "8. Children's Privacy", body: "Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected such information, we will delete it promptly." },
  { Icon: Pencil, title: "9. Changes to This Privacy Policy", body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date. We encourage you to review this policy regularly." },
  { Icon: Phone, title: "10. Contact Us", body: "If you have any questions about this Privacy Policy or our data practices, please contact us." },
];

function PrivacyPolicy() {
  return (
    <CustomerCareScaffold
      activeId="privacy-policy"
      title="Privacy Policy"
      subtitle="Your privacy is important to us. This Privacy Policy explains how ASL ORIGINALS collects, uses, protects, and shares your information."
    >
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.title} className="flex gap-4">
            <div className="shrink-0 h-9 w-9 rounded-full bg-muted grid place-items-center">
              <s.Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[13.5px] text-ink">{s.title}</h3>
              <p className="mt-1 text-[12.5px] text-foreground/75 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactRow Icon={Mail} label="Email" value="customerservice@asloriginals.com" />
        <ContactRow Icon={Phone} label="Phone / WhatsApp" value="+234 810 123 4567" />
        <ContactRow Icon={MapPin} label="Address" value="Lekki Phase 1, Lagos, Nigeria" />
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-4 flex items-center gap-4">
        <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/80">
          <div className="font-semibold text-ink">Your Privacy Matters</div>
          We are committed to protecting your personal information and ensuring transparency in everything we do.
        </div>
      </div>
    </CustomerCareScaffold>
  );
}

function ContactRow({ Icon, label, value }: { Icon: typeof Mail; label: string; value: string }) {
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
