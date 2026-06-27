import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import processImg from "@/assets/process.jpg";
import storeImg from "@/assets/store.jpg";
import dark from "@/assets/dark.jpg";
import gift from "@/assets/gift.jpg";
import seasonal from "@/assets/seasonal.jpg";
import { X } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — ETERNITY Ooty" },
      {
        name: "description",
        content:
          "A cinematic gallery of chocolate-making moments, store ambiance, and Ooty aesthetics.",
      },
      { property: "og:title", content: "Gallery — ETERNITY" },
      {
        property: "og:description",
        content: "Behind the counter at our handmade chocolate boutique in Ooty.",
      },
    ],
  }),
  component: Gallery,
});

const images = [
  { src: g1, alt: "Piping ganache into truffles" },
  { src: storeImg, alt: "The boutique storefront" },
  { src: g2, alt: "Cocoa pods on burlap" },
  { src: dark, alt: "Hand-rolled dark truffles" },
  { src: g3, alt: "Hot chocolate in a porcelain cup" },
  { src: processImg, alt: "Pouring melted chocolate" },
  { src: g4, alt: "A regular customer with a gift box" },
  { src: g5, alt: "Tempering on marble" },
  { src: gift, alt: "Petite gift box" },
  { src: g6, alt: "Foggy Ooty street at dusk" },
  { src: seasonal, alt: "Seasonal winter spice collection" },
];

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="pb-24">
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Gallery</p>
        <h1 className="font-display text-5xl md:text-7xl text-balance">
          Moments from the kitchen.
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
          Soft mornings, slow afternoons, and the quiet joy of chocolate becoming chocolate.
        </p>
      </section>

      <section className="container mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setOpen(i)}
              className="group mb-5 block w-full overflow-hidden rounded-3xl shadow-soft break-inside-avoid relative"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.03_45/0.6)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <p className="text-[oklch(0.96_0.018_80)] text-sm">{img.alt}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 bg-[oklch(0.12_0.02_45/0.92)] backdrop-blur-md grid place-items-center p-6 animate-in fade-in duration-300"
          onClick={() => setOpen(null)}
        >
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute top-6 right-6 grid h-10 w-10 place-items-center rounded-full glass-dark text-[oklch(0.96_0.018_80)]"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={images[open].src}
            alt={images[open].alt}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-luxe object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
