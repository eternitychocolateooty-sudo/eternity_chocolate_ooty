import { createFileRoute } from "@tanstack/react-router";
import processImg from "@/assets/process.jpg";
import storeImg from "@/assets/store.jpg";
import ootyImg from "@/assets/ooty.jpg";
import g2 from "@/assets/g2.jpg";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — ETERNITY Chocolate Shop in Ooty" },
      {
        name: "description",
        content: "A small family kitchen, a slow Ooty fog, and a quiet belief in the best chocolate.",
      },
      { property: "og:title", content: "Our Story — ETERNITY" },
      {
        property: "og:description",
        content: "A timeless destination that reflects the spirit, beauty, and culture of the Nilgiris.",
      },
    ],
  }),
  component: Story,
});

const timeline = [
  {
    year: "The Beginning",
    title: "",
    text: "A small idea inspired by the beauty and culture of Ooty.",
  },
  {
    year: "Growing",
    title: "With Visitors",
    text: "As more travelers discovered the store, Eternity became a familiar stop in their journey through the Nilgiris.",
  },
  {
    year: "Trust",
    title: "Building Trust",
    text: "Through quality, consistency, and genuine service, the store earned the confidence of locals and tourists alike.",
  },
  {
    year: "Destination",
    title: "Becoming a Destination",
    text: "What started as a shop evolved into a place people recommend, revisit, and remember.",
  },
  {
    year: "Today",
    title: "Still rooted",
    text: "Still rooted in the same values—authenticity, quality, and a deep love for the hills we call home.",
  },
];

function Story() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ootyImg} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="container mx-auto px-6 relative text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-7xl text-balance max-w-4xl mx-auto">
            Made by hand, in the hills, for almost three decades.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A small family kitchen, a slow Ooty fog, and a quiet belief that the best chocolate
            still comes from someone who tastes every batch.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 bg-gradient-cream">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">The Journey</p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent to-transparent md:-translate-x-1/2" />
            <ol className="space-y-12">
              {timeline.map((t, i) => (
                <li
                  key={t.year}
                  className={`relative md:grid md:grid-cols-2 md:gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div
                    className={`pl-12 md:pl-0 ${i % 2 ? "md:text-left md:pl-10" : "md:text-right md:pr-10"}`}
                  >
                    <p className="font-display text-4xl gold-text">{t.year}</p>
                    {t.title && <h3 className="font-display text-2xl mt-2">{t.title}</h3>}
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.text}</p>
                  </div>
                  <div className="hidden md:block" />
                  <span className="absolute left-3 md:left-1/2 top-2 -translate-x-1/2 grid h-3 w-3 place-items-center">
                    <span className="h-3 w-3 rounded-full bg-gradient-gold shadow-gold" />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        <div className="relative">
          <img
            src={processImg}
            alt="Chosen with purpose"
            loading="lazy"
            className="rounded-3xl shadow-luxe w-full"
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Our Approach</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Chosen with purpose.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            We believe meaningful experiences are created through attention to detail.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From the products we select to the way we welcome every guest, everything is guided by one principle: quality over quantity.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No rush. No shortcuts. Just a commitment to offering something worthy of the place it represents.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="container mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-cocoa text-[oklch(0.96_0.018_80)] p-10 md:p-16 grid md:grid-cols-2 gap-10 shadow-luxe">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-3">Our Vision</p>
            <h3 className="font-display text-3xl md:text-4xl">To become a timeless destination</h3>
            <p className="mt-4 text-[oklch(0.96_0.018_80/0.75)] leading-relaxed">
              that reflects the spirit, beauty, and culture of the Nilgiris.
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-3">Our Mission</p>
            <h3 className="font-display text-3xl md:text-4xl">To help every visitor take home a lasting memory</h3>
            <p className="mt-4 text-[oklch(0.96_0.018_80/0.75)] leading-relaxed">
              of Ooty through quality, authenticity, and heartfelt service.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <img
          src={storeImg}
          alt="The ETERNITY boutique on a quiet morning"
          loading="lazy"
          className="rounded-3xl shadow-luxe w-full"
        />
      </section>
    </div>
  );
}
