import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import img1 from "@/assets/gallery-1.webp";
import img2 from "@/assets/gallery-2.webp";
import img3 from "@/assets/gallery-3.webp";
import img4 from "@/assets/gallery-4.webp";
import img5 from "@/assets/gallery-5.webp";
import img6 from "@/assets/gallery-6.webp";
import img7 from "@/assets/gallery-7.webp";
import img8 from "@/assets/gallery-8.webp";
import img9 from "@/assets/gallery-9.webp";
import img10 from "@/assets/gallery-10.webp";
import img11 from "@/assets/gallery-11.webp";
import img12 from "@/assets/gallery-12.webp";
import img13 from "@/assets/gallery-13.webp";
import img14 from "@/assets/gallery-14.webp";
import img15 from "@/assets/gallery-15.webp";
import img16 from "@/assets/gallery-16.webp";
import img17 from "@/assets/gallery-17.webp";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — ETERNITY Handcrafted Ooty Chocolates" },
      {
        name: "description",
        content:
          "A cinematic gallery of handcrafted Ooty chocolates, artisan truffles, Nilgiri spices, store ambiance & boutique moments at Eternity Chocolate Ooty.",
      },
      { property: "og:title", content: "Gallery — ETERNITY Ooty Chocolates" },
      {
        property: "og:description",
        content: "Authentic moments from our handcrafted chocolate boutique in Charring Cross, Ooty.",
      },
      { property: "og:url", content: "https://eternitychocolateooty.in/gallery" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://eternitychocolateooty.in/gallery" },
    ],
  }),
  component: Gallery,
});

const images = [
  { src: img1, title: "Artisan Chocolate Display", alt: "Handcrafted Ooty chocolates displayed elegantly at Eternity Store" },
  { src: img2, title: "Fresh Hand-Rolled Truffles", alt: "Freshly made dark chocolate truffles with Nilgiri cocoa" },
  { src: img3, title: "Signature Gift Boxes", alt: "Luxury gift boxes packaged for sweet cravings in Ooty" },
  { src: img4, title: "Dark Almond Crunch", alt: "Premium dark almond chocolate slabs with golden honey" },
  { src: img5, title: "Ooty Storefront Ambiance", alt: "Eternity Chocolate Ooty boutique ambiance at Charring Cross" },
  { src: img6, title: "Velvet Milk Chocolates", alt: "Creamy silken milk chocolate bars handcrafted in small batches" },
  { src: img7, title: "Nilgiri Mountain Spices", alt: "Authentic cardamom, quilled cinnamon & cloves from Ooty hills" },
  { src: img8, title: "Old-Recipe Walnut Fudge", alt: "Soft homemade walnut fudge made fresh every morning" },
  { src: img9, title: "Single-Origin 70% Cocoa", alt: "Dark single-origin chocolate with rich roasted cocoa notes" },
  { src: img10, title: "Boutique Showcase", alt: "Handcrafted chocolate counter at Eternity Charring Cross store" },
  { src: img11, title: "Roasted Nilgiri Coffee", alt: "Freshly roasted aromatic coffee beans & cocoa nibs" },
  { src: img12, title: "Artisan Gift Selection", alt: "Curated gourmet chocolate gift boxes for visitors in Ooty" },
  { src: img13, title: "Tempering & Craftsmanship", alt: "Artisan chocolate tempering process in the Ooty kitchen" },
  { src: img14, title: "Assorted Chocolate Pralines", alt: "Rich assorted chocolate pralines and nut clusters" },
  { src: img15, title: "Nilgiri Tea & Chocolate Pairing", alt: "Authentic Nilgiri green tea paired with handcrafted chocolates" },
  { src: img16, title: "Warm Cocoa Delights", alt: "Delicious hot chocolate and artisanal dessert treats" },
  { src: img17, title: "Eternity Ooty Heritage", alt: "The warmth and rich heritage of Eternity Chocolates Ooty" },
];

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open !== null) {
      setOpen((open + 1) % images.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open !== null) {
      setOpen((open - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="pb-24">
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Official Gallery</p>
        <h1 className="font-display text-5xl md:text-7xl text-balance">
          Moments from our boutique.
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          Fresh handcrafted chocolates, Nilgiri spices, aromatic tea, and authentic store ambiance from Charring Cross, Ooty.
        </p>
      </section>

      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-soft border border-amber-950/20 bg-[#150B08] transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a07]/90 via-[#0f0a07]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                <span className="text-xs uppercase tracking-widest text-accent font-medium">
                  {img.title}
                </span>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2">{img.alt}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#0f0a07]/95 backdrop-blur-md grid place-items-center p-4 md:p-8 animate-in fade-in duration-300 select-none"
          onClick={() => setOpen(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute top-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-stone-900/80 border border-amber-900/30 text-stone-200 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Previous button */}
          <button
            onClick={handlePrev}
            aria-label="Previous Image"
            className="absolute left-4 md:left-8 z-10 grid h-12 w-12 place-items-center rounded-full bg-stone-900/80 border border-amber-900/30 text-stone-200 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            aria-label="Next Image"
            className="absolute right-4 md:right-8 z-10 grid h-12 w-12 place-items-center rounded-full bg-stone-900/80 border border-amber-900/30 text-stone-200 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image and Title */}
          <div
            className="flex flex-col items-center max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[open].src}
              alt={images[open].alt}
              className="max-h-[75vh] max-w-[90vw] rounded-2xl border border-amber-900/30 shadow-2xl object-contain"
            />
            <div className="mt-4 text-center">
              <h3 className="font-display text-xl md:text-2xl text-amber-200">
                {images[open].title}
              </h3>
              <p className="text-sm text-stone-400 mt-1 max-w-md">
                {images[open].alt}
              </p>
              <span className="text-xs text-amber-500/80 mt-2 block font-mono">
                {open + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
