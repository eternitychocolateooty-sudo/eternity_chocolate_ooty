import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MapPin,
  Heart,
  Sparkles,
  Quote,
  Instagram,
  Leaf,
  Award,
  Clock,
  Star,
} from "lucide-react";
import heroImg from "@/assets/hero-chocolate.jpg";
import processImg from "@/assets/process.jpg";
import storeImg from "@/assets/store.jpg";
import ootyImg from "@/assets/ooty.jpg";
import dark from "@/assets/dark.jpg";
import milk from "@/assets/milk.jpg";
import nuts from "@/assets/nuts.jpg";
import gift from "@/assets/gift.jpg";
import g1 from "@/assets/g1.jpg";
import g3 from "@/assets/g3.jpg";
import g5 from "@/assets/g5.jpg";
import { useCart } from "@/components/CartContext";
import { resolveProductImage } from "@/lib/utils";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ETERNITY — Handcrafted Chocolates From the Heart of Ooty" },
      {
        name: "description",
        content:
          "Discover small-batch artisan chocolates handmade in the misty hills of Ooty. Family-owned boutique. Visit us in store.",
      },
      { property: "og:title", content: "ETERNITY — Handcrafted Chocolates From Ooty" },
      {
        property: "og:description",
        content: "Made with passion, richness, and authentic homemade flavors.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const cart = useCart();
  const products = cart.products;
  const isLoading = cart.isLoadingProducts;

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Handcrafted chocolate bars dusted with gold against the misty Ooty hills"
            className="absolute inset-0 h-full w-full object-cover scale-105 animate-float"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.16_0.03_45/0.85)] via-[oklch(0.18_0.03_45/0.55)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl text-[oklch(0.96_0.018_80)]">
            <p className="reveal flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-accent mb-6">
              <span className="h-px w-10 bg-accent" /> Est. in the Nilgiris
            </p>
            <h1 className="reveal reveal-delay-1 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-balance">
              Handcrafted chocolates from the{" "}
              <em className="gold-text not-italic">heart of Ooty</em>.
            </h1>
            <p className="reveal reveal-delay-2 mt-7 text-lg md:text-xl text-[oklch(0.96_0.018_80/0.85)] max-w-xl leading-relaxed">
              Made with passion, richness, and authentic homemade flavors — slow-crafted in small
              batches in the misty hills.
            </p>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
              <Link
                to="/collections"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3.5 text-[oklch(0.22_0.035_50)] font-medium shadow-gold hover:shadow-luxe transition-all hover:-translate-y-0.5"
              >
                Explore Our Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/visit"
                className="inline-flex items-center gap-2 rounded-full glass-dark text-[oklch(0.96_0.018_80)] px-7 py-3.5 font-medium hover:bg-[oklch(0.96_0.018_80/0.1)] transition-all"
              >
                <MapPin className="h-4 w-4" /> Visit Our Store
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* SIGNATURE COLLECTION */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              Signature Chocolates
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              A taste of the hills, in every bite.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Six recipes the family has perfected across three generations. Each one is tempered by
              hand and finished in our Ooty kitchen the same morning it reaches our shelves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col bg-card rounded-3xl h-[380px] overflow-hidden shadow-soft">
                  <div className="bg-secondary aspect-[4/5] w-full" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="h-6 bg-secondary rounded w-2/3" />
                    <div className="h-4 bg-secondary rounded w-full" />
                    <div className="mt-auto flex items-center justify-between">
                      <div className="h-5 bg-secondary rounded w-1/4" />
                      <div className="h-8 w-8 bg-secondary rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              products.slice(0, 4).map((p, i) => (
                <article
                  key={p.id}
                  className={`group flex flex-col reveal reveal-delay-${(i % 4) + 1} hover-lift bg-card rounded-3xl overflow-hidden shadow-soft`}
                >
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="block aspect-[4/5] overflow-hidden">
                    <img
                      src={resolveProductImage(p.images[0])}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col">
                    <Link to="/products/$slug" params={{ slug: p.slug }} className="flex-1 block">
                      <h3 className="font-display text-xl">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        className="text-sm font-medium text-accent hover:underline transition-colors"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors"
            >
              See the full collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-24 md:py-32 bg-gradient-cream">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <img
              src={storeImg}
              alt="Inside the ETERNITY chocolate boutique in Ooty"
              loading="lazy"
              className="rounded-3xl shadow-luxe w-full"
              width={1280}
              height={1280}
            />
            <div className="absolute -bottom-6 -right-6 bg-foreground text-background rounded-2xl px-5 py-4 shadow-luxe hidden md:block">
              <p className="font-display text-3xl text-accent">28</p>
              <p className="text-xs text-background/80">years in the hills</p>
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Our Story</p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              A small family kitchen, carried by the cool Ooty breeze.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We started in 1997 with one copper pot and a notebook of recipes from grandmother's
              kitchen. Today our shop on Charing Cross still smells the same — like roasted cocoa,
              fresh cream, and woodsmoke from the hills.
            </p>
            <Link
              to="/story"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 hover:opacity-90 transition-opacity shadow-soft"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY THEY LOVE US */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              Why customers love us
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              A boutique built on patience.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                Icon: Leaf,
                title: "Small batches, always",
                text: "Never more than 2 kg at a time. Every piece tasted before it leaves the kitchen.",
              },
              {
                Icon: Heart,
                title: "Family recipes",
                text: "Three generations of refinement. Nothing artificial — only what we'd serve at home.",
              },
              {
                Icon: Award,
                title: "Pure single-origin",
                text: "Cocoa sourced from a co-operative in Idukki, milk from Nilgiri dairies down the road.",
              },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="rounded-3xl p-8 bg-card shadow-soft hover-lift">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold mb-5 shadow-gold">
                  <Icon className="h-5 w-5 text-[oklch(0.22_0.035_50)]" />
                </div>
                <h3 className="font-display text-2xl mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS — Ooty inspired */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={ootyImg}
            alt=""
            className="h-full w-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">The Process</p>
              <h2 className="font-display text-4xl md:text-5xl text-balance">
                Slow-crafted, the way the hills taught us.
              </h2>
              <ol className="mt-8 space-y-6">
                {[
                  ["Roast", "Beans roasted by feel — never a thermometer in sight."],
                  ["Conch", "36 hours of stone-grinding for that silken finish."],
                  ["Temper", "Cooled on marble until the snap is just right."],
                  ["Finish", "Hand-piped, hand-dipped, hand-wrapped that morning."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-5">
                    <span className="font-display text-3xl gold-text w-8 shrink-0">0{i + 1}</span>
                    <div>
                      <h4 className="font-display text-xl">{t}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative">
              <img
                src={processImg}
                alt="Chocolatier pouring ganache over hand-shaped truffles"
                loading="lazy"
                className="rounded-3xl shadow-luxe w-full"
                width={1280}
                height={1280}
              />
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent mb-3">
                Behind the counter
              </p>
              <h2 className="font-display text-4xl md:text-5xl">A glimpse inside.</h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors"
            >
              Full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[g1, g3, g5, processImg].map((img, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl shadow-soft ${i % 3 === 0 ? "md:row-span-2 aspect-[3/4] md:aspect-auto" : "aspect-square"}`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 bg-gradient-cream">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Sparkles className="h-6 w-6 text-accent mx-auto mb-4" />
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              Words from our regulars.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Abhishek Rana",
                stars: 5,
                time: "2 years ago",
                quote: "Your one stop shop for shopping in Ooty. Be it authentic ooty chocolates, fridge magnets, spices or medicinal n essential oils .. they have evething !! And what quality. 🌟 Must visit ! 👍",
              },
              {
                name: "m.r.digital roy",
                stars: 5,
                time: "a year ago",
                quote: "Premium quality chocolate . Quality of the chocolate is so good . Must try . Staffs are so friendly .I had my best experience in the shop",
              },
              {
                name: "DS",
                stars: 4,
                time: "a year ago",
                quote: "Nice chocolate shop located in the centre of the city. They have all kinds of homemade chocolates, jelly, large lollipops and many more things available. I would definitely recommend getting the chocolate covered cookies. These were superb.",
              },
              {
                name: "Deepak Verma",
                stars: 5,
                time: "5 months ago",
                quote: "Lot of good verity spies, chocolates, oils , tea powder & coffee beans all very good and pure veg",
              },
            ].map((t, i) => (
              <figure key={i} className="rounded-3xl glass p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-accent mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${idx < t.stars ? "fill-current" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <blockquote className="font-display text-sm leading-relaxed text-foreground">
                    "{t.quote}"
                  </blockquote>
                </div>
                <div className="mt-6 flex justify-between items-center border-t border-border/30 pt-4">
                  <figcaption className="text-[11px] font-semibold text-foreground">
                    {t.name}
                  </figcaption>
                  <span className="text-[9px] text-muted-foreground">{t.time}</span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <Instagram className="h-7 w-7 text-accent mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl">@eternity</h2>
          <p className="text-muted-foreground mt-2">Follow the chocolate-making moments</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[g5, g1, processImg, g3].map((img, i) => (
              <a
                key={i}
                href="https://www.instagram.com/_eternity_chocolates_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noreferrer noopener"
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[oklch(0.18_0.03_45/0)] group-hover:bg-[oklch(0.18_0.03_45/0.5)] transition-colors grid place-items-center">
                  <Instagram className="h-7 w-7 text-[oklch(0.96_0.018_80)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl bg-gradient-cocoa text-[oklch(0.96_0.018_80)] p-12 md:p-20 text-center shadow-luxe relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
            <Clock className="h-7 w-7 text-accent mx-auto mb-5 relative" />
            <h2 className="font-display text-4xl md:text-6xl text-balance relative">
              Open daily, from morning mist to evening glow.
            </h2>
            <p className="mt-4 text-[oklch(0.96_0.018_80/0.7)] relative">
              Open · 9 am Closes 10:30 pm · no 7,8, bharathiyar complex, charring. cross, Ooty, Tamil Nadu 643001
            </p>
            <Link
              to="/visit"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3.5 text-[oklch(0.22_0.035_50)] font-medium shadow-gold hover:-translate-y-0.5 transition-all"
            >
              Plan your visit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
