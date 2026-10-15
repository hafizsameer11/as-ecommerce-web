import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Star, ShoppingBag, Package, Globe2, ArrowDown, ArrowRight, Check } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import storyImg from "@/assets/about-story.jpg";
import missionImg from "@/assets/about-mission.jpg";

export const Route = createFileRoute("/customer-care/about-us")({
  head: () => ({
    meta: [
      { title: "About Us - ASL ORIGINALS" },
      { name: "description", content: "ASL ORIGINALS - Authentic. Curated. Trusted. A premium fashion destination for those who value quality and timeless style." },
      { property: "og:title", content: "About ASL ORIGINALS" },
      { property: "og:description", content: "Authentic. Curated. Trusted. The house behind ASL ORIGINALS - luxury fashion, sourced with integrity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutUs,
});

const stats = [
  { Icon: ShoppingBag, value: "10,000+", label: "Happy Clients" },
  { Icon: Package, value: "5,000+", label: "Pieces Delivered" },
  { Icon: Globe2, value: "100%", label: "Authentic" },
  { Icon: Star, value: "4.9/5", label: "Client Rating" },
];

const chapters = [
  {
    no: "01",
    title: "The Beginning",
    body: "ASL ORIGINALS was created to give customers a trusted place to shop authentic luxury fashion without compromise. We believe buying genuine products should be simple, secure, and worry free.",
  },
  {
    no: "02",
    title: "Our Sourcing",
    body: "Every product is carefully sourced from trusted retailers, official brand stores, and verified suppliers across leading luxury markets, including the United Kingdom, Italy, France, the United States, Japan, and other established global fashion destinations. Every item is selected with authenticity, quality, and craftsmanship as our highest priorities.",
  },
  {
    no: "03",
    title: "Our Promise",
    body: "We promise to deliver only authentic products, backed by trusted sourcing, honest service, and a premium shopping experience. Every order reflects our commitment to quality, trust, and customer satisfaction.",
  },
];

const values = [
  { title: "Authenticity", body: "We are committed to offering only genuine products sourced through trusted and verified channels." },
  { title: "Curation", body: "We thoughtfully curate every collection, selecting authentic products that meet our standards for quality, craftsmanship, and timeless style." },
  { title: "Trust", body: "We build lasting relationships through honesty, transparency, and reliability." },
  { title: "Quality", body: "We carefully select every product to meet the highest standards of authenticity and craftsmanship." },
  { title: "Excellence", body: "We strive for excellence in every detail, from sourcing to customer service." },
  { title: "Customer First", body: "Our customers are at the heart of everything we do, and their satisfaction is our highest priority." },
  { title: "Service", body: "We are dedicated to providing exceptional service that makes every shopping experience simple, seamless, and memorable." },
];

const why = [
  "Carefully curated collections.",
  "Fast and reliable delivery.",
  "Dedicated concierge support.",
  "Easy returns and exchanges.",
];

function AboutUs() {
  return (
    <CustomerCareScaffold
      activeId="about-us"
      title=""
      subtitle=""
      showHero={false}
      showSidebar={false}
    >
      {/* Editorial hero */}
      <section className="relative overflow-hidden rounded-xl bg-ink text-white min-h-[360px] md:min-h-[520px] flex items-center">
        <img
          src={storyImg}
          alt="Inside the ASL ORIGINALS boutique"
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        <div className="relative w-full p-8 md:p-16 lg:p-20">
          <div className="text-[11px] md:text-[12px] tracking-[0.4em] uppercase text-gold">Est. Lagos - Worldwide</div>
          <h2 className="mt-5 md:mt-7 font-display text-[42px] md:text-[68px] lg:text-[84px] leading-[0.95] font-bold uppercase max-w-[16ch]">
            Luxury
          </h2>
          <p className="mt-5 md:mt-6 text-[15px] md:text-[18px] text-white/80 leading-relaxed max-w-xl">
            A world of authentic luxury, defined by exceptional quality and considered curation.
          </p>
          <a
            href="#our-story"
            className="mt-8 md:mt-10 inline-flex items-center gap-3 h-12 md:h-14 px-8 md:px-10 rounded-full bg-gold text-ink text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] hover:brightness-110 transition"
          >
            Discover Our Story
            <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </div>
      </section>

      {/* About heading */}
      <section className="space-y-4 md:space-y-5">
        <div className="text-[11px] md:text-[12px] tracking-[0.4em] uppercase text-muted-foreground">About ASL ORIGINALS</div>
        <h2 className="font-display text-[34px] md:text-[52px] leading-[1.05] font-bold uppercase tracking-wide">About Us</h2>
        <p className="text-[15px] md:text-[17px] text-foreground/75 leading-relaxed max-w-2xl">
          <strong className="font-bold text-foreground">AUTHENTIC. CURATED. TRUSTED.</strong>
        </p>
        <p className="text-[15px] md:text-[17px] text-foreground/75 leading-relaxed max-w-2xl">
          ASL ORIGINALS is a premium destination for authentic luxury fashion, offering carefully curated clothing, footwear, accessories, fragrances, and timepieces from trusted global retailers and verified suppliers.
        </p>
        <p className="text-[15px] md:text-[17px] text-foreground/75 leading-relaxed max-w-2xl">
          Every product is selected with authenticity, quality, and craftsmanship in mind, delivering a shopping experience built on trust, confidence, and exceptional service for customers worldwide.
        </p>
      </section>

      {/* Story chapters */}
      <section id="our-story" className="scroll-mt-24 pt-2">
        <div className="text-[11px] md:text-[12px] tracking-[0.4em] uppercase text-muted-foreground">Our Story</div>
        <div className="mt-2 h-1 w-12 bg-gold" />
        <div className="mt-8 md:mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
          {chapters.map((c) => (
            <article key={c.no} className="relative rounded-xl border border-border bg-white p-7 md:p-8">
              <div className="font-display text-[42px] md:text-[52px] leading-none font-bold text-gold/30">{c.no}</div>
              <h3 className="mt-4 font-display text-[18px] md:text-[20px] font-bold uppercase tracking-wide">{c.title}</h3>
              <p className="mt-3 text-[14px] md:text-[15px] text-foreground/75 leading-relaxed">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
        <img
          src={missionImg}
          alt="Curated luxury wardrobe"
          width={1200}
          height={900}
          loading="lazy"
          className="w-full h-[280px] md:h-full min-h-[520px] object-cover rounded-xl"
        />
        <div className="rounded-xl border border-border bg-muted/40 p-7 md:p-10 flex flex-col">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="text-[11px] md:text-[12px] tracking-[0.35em] uppercase text-gold">Mission</div>
              <p className="text-[18px] md:text-[22px] leading-snug font-semibold">
                To make authentic luxury fashion accessible through trusted sourcing, genuine products, and exceptional service, inspiring confidence with every purchase.
              </p>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-3">
              <div className="text-[11px] md:text-[12px] tracking-[0.35em] uppercase text-gold">Vision</div>
              <p className="text-[18px] md:text-[22px] leading-snug font-semibold">
                To be the world's most trusted destination for authentic luxury fashion, setting the global standard for trust, quality, and customer experience.
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-8" />

          <div className="space-y-5 flex-1">
            <div className="text-[11px] md:text-[12px] tracking-[0.35em] uppercase text-gold">Our Values</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-lg border border-border bg-white p-5">
                  <div className="font-display text-[15px] md:text-[16px] font-bold uppercase tracking-wide">{v.title}</div>
                  <p className="mt-2 text-[13px] md:text-[14px] text-foreground/70 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-xl bg-ink text-white p-8 md:p-12 lg:p-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {stats.map((s) => (
          <div key={s.label} className="space-y-2">
            <s.Icon className="h-5 w-5 text-gold" strokeWidth={1.75} />
            <div className="font-display text-[32px] md:text-[42px] leading-none font-bold">{s.value}</div>
            <div className="text-[11px] md:text-[12px] text-white/60 uppercase tracking-[0.18em]">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Why + CTA */}
      <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-4">
          <h2 className="font-display text-[26px] md:text-[36px] font-bold uppercase tracking-wide">Why Shop With Us?</h2>
          <div className="h-1 w-12 bg-gold" />
          <p className="text-[15px] md:text-[16px] text-foreground/75 leading-relaxed max-w-lg">
            We don't just sell products - we deliver confidence. Choosing ASL ORIGINALS means choosing
            authenticity, quality, and a house that values you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 h-12 md:h-14 px-8 md:px-10 rounded-full bg-ink text-white text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] hover:bg-ink/90 transition"
          >
            Shop The Collection
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
        <ul className="space-y-4">
          {why.map((w) => (
            <li key={w} className="flex items-center gap-4 text-[15px] md:text-[16px] text-foreground/85 border-b border-border pb-4 last:border-0">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              {w}
            </li>
          ))}
        </ul>
      </section>
    </CustomerCareScaffold>
  );
}
