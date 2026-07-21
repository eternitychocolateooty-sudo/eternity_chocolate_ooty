import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Instagram, MessageCircle, Mail, Star } from "lucide-react";
import storeImg from "@/assets/store.jpg";
import { safeJsonStringify } from "@/lib/utils";
import { EmailObfuscator } from "@/components/ui/EmailObfuscator";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit Us — ETERNITY Ooty Chocolate Boutique & Store" },
      {
        name: "description",
        content:
          "Visit Eternity Chocolate Boutique at Bharathiyar Complex, Ooty. Open 9:00 AM to 10:30 PM daily. Call 084894 62100 or stop by for fresh homemade chocolates.",
      },
      { property: "og:title", content: "Visit ETERNITY Chocolate Store — Ooty" },
      {
        property: "og:description",
        content: "Our boutique at Bharathiyar Complex, Ooty. Stop by for fresh handcrafted chocolates and hot cocoa.",
      },
      { property: "og:url", content: "https://eternitychocolateooty.com/visit" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Visit ETERNITY Chocolate Store — Ooty" },
      { name: "twitter:description", content: "Boutique at Bharathiyar Complex, Ooty. Open daily 9 AM - 10:30 PM." },
    ],
    links: [
      { rel: "canonical", href: "https://eternitychocolateooty.com/visit" },
    ],
  }),
  component: Visit,
});

function Visit() {
  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonStringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "ETERNITY Handcrafted Chocolates",
            "image": "https://eternitychocolateooty.com/assets/logo.png",
            "@id": "https://eternitychocolateooty.com/#store",
            "url": "https://eternitychocolateooty.com",
            "telephone": "084894 62100",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "No 7,8, Bharathiyar Complex, Charring Cross",
              "addressLocality": "Ooty",
              "addressRegion": "Tamil Nadu",
              "postalCode": "643001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 11.4116,
              "longitude": 76.7088
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "09:00",
              "closes": "22:30"
            },
            "sameAs": [
              "https://www.instagram.com/eternitychocolateooty/"
            ]
          })
        }}
      />
      {/* HERO */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={storeImg}
          alt="ETERNITY boutique storefront"
          className="absolute inset-0 h-full w-full object-cover scale-105 brightness-[0.4]"
        />
        <div className="container mx-auto px-6 relative pb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Visit Us</p>
          <h1 className="font-display text-5xl md:text-7xl text-[oklch(0.96_0.018_80)] text-balance max-w-3xl">
            Come find us in the mist.
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12">
        {/* INFO CARD */}
        <div className="space-y-6">
          {[
            {
              Icon: MapPin,
              label: "The Boutique",
              lines: ["no 7,8, bharathiyar complex, charring. cross", "Ooty", "Tamil Nadu 643001"],
            },
            { Icon: Clock, label: "Hours", lines: ["Open", "9:00 am – 10:30 pm"] },
            { Icon: Phone, label: "Call us", lines: ["084894 62100"] },
            { Icon: Mail, label: "Email", lines: [] },
          ].map(({ Icon, label, lines }) => (
            <div key={label} className="rounded-3xl glass p-6 shadow-soft flex gap-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold shrink-0 shadow-gold">
                <Icon className="h-5 w-5 text-[oklch(0.22_0.035_50)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">{label}</p>
                {label === "Email" ? (
                  <EmailObfuscator className="text-foreground leading-relaxed inline-block" />
                ) : (
                  lines.map((l) => (
                    <p key={l} className="text-foreground leading-relaxed">
                      {l}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <a
              href="https://wa.me/918489462100"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-[oklch(0.22_0.035_50)] font-medium shadow-gold hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href="https://www.instagram.com/_eternity_chocolates_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer noopener"
              className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* GOOGLE MAP REVIEW CARD */}
        <div className="rounded-3xl bg-card p-8 md:p-10 shadow-luxe flex flex-col justify-center items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-gold mb-6 shadow-gold">
            <Star className="h-8 w-8 text-[oklch(0.22_0.035_50)] fill-current" />
          </div>
          <h2 className="font-display text-4xl mb-4">Give us your review on Google Map</h2>
          <p className="text-muted-foreground leading-relaxed max-w-md mb-8">
            Loved our chocolates? Share your experience with other travellers and chocolate lovers by writing a review on our Google Maps profile.
          </p>
          <a
            href="https://www.google.com/maps/place/Eternity/@11.4117425,76.7079431,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba8bd3d37413427:0x8ca83f52da071d57!8m2!3d11.4117425!4d76.7079431!16s%2Fg%2F11qwsqsgh8!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-gold px-8 py-4 text-[oklch(0.22_0.035_50)] font-semibold shadow-gold hover:-translate-y-0.5 transition-all mb-8"
          >
            <Star className="h-5 w-5 fill-current" /> Write a Review
          </a>

          {/* BEST REVIEW OUT OF FOUR */}
          <div className="max-w-md border-t border-border/30 pt-6 w-full text-center">
            <div className="flex justify-center text-accent gap-0.5 mb-2">
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <blockquote className="text-sm font-medium italic text-muted-foreground mb-3">
              "Your one stop shop for shopping in Ooty. Be it authentic ooty chocolates, fridge magnets, spices or medicinal n essential oils .. they have evething !! And what quality. Must visit !"
            </blockquote>
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">— Abhishek Rana</p>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="container mx-auto px-6">
        <div className="rounded-3xl overflow-hidden shadow-luxe border border-border">
          <iframe
            title="ETERNITY location, Ooty"
            src="https://maps.google.com/maps?q=Eternity,+no+7,8,+bharathiyar+complex,+charring.+cross,+Ooty,+Tamil+Nadu+643001&t=&z=17&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[460px] block"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
