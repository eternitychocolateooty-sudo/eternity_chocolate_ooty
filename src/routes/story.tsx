import { createFileRoute } from "@tanstack/react-router";
import processImg from "@/assets/process.jpg";
import storeImg from "@/assets/store.jpg";
import ootyImg from "@/assets/ooty.jpg";
import g2 from "@/assets/g2.jpg";

import { safeJsonStringify } from "@/lib/utils";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — ETERNITY Handcrafted Chocolates Ooty" },
      {
        name: "description",
        content:
          "Learn about Eternity Chocolates in Ooty — a family-owned artisan chocolate boutique slow-crafting small-batch homemade chocolates in the Nilgiri hills.",
      },
      { property: "og:title", content: "Our Story — ETERNITY Handcrafted Chocolates Ooty" },
      {
        property: "og:description",
        content: "A small family kitchen in the misty Ooty hills, slow-crafting unforgettable artisan chocolates for three decades.",
      },
      { property: "og:url", content: "https://eternitychocolateooty.com/story" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Our Story — ETERNITY Handcrafted Chocolates Ooty" },
      { name: "twitter:description", content: "Family-owned artisan chocolate boutique slow-crafting chocolates in Ooty." },
    ],
    links: [
      { rel: "canonical", href: "https://eternitychocolateooty.com/story" },
    ],
  }),
  component: Story,
});


function Story() {
  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonStringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "Our Story — ETERNITY Handcrafted Chocolates Ooty",
            "description": "Family-owned artisan chocolate boutique slow-crafting small-batch homemade chocolates in Ooty.",
            "mainEntity": {
              "@type": "Organization",
              "name": "ETERNITY Handcrafted Chocolates",
              "url": "https://eternitychocolateooty.com",
              "logo": "https://eternitychocolateooty.com/assets/logo.png"
            }
          })
        }}
      />
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

      {/* OUR STORY */}
      <section className="py-24 bg-gradient-cream">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Our Story</p>
            <h2 className="font-display text-4xl md:text-5xl mb-10 text-foreground">The Journey</h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                Every chocolate has a story, and ours begins with a simple dream—to create moments of happiness. 
                We carefully select the finest cocoa and premium ingredients, blending tradition with creativity 
                to craft chocolates that delight every bite.
              </p>
              <p>
                From rich dark chocolate to creamy milk chocolate and handcrafted treats, each piece is made with 
                love, passion, and attention to detail. Whether you're celebrating a special occasion, gifting 
                someone you love, or simply treating yourself, our chocolates are made to make every moment memorable.
              </p>
              <p className="font-display text-xl md:text-2xl text-accent font-medium mt-10">
                Because life is sweeter when shared—one chocolate at a time. 🍫✨
              </p>
            </div>
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
