import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle, Mail, Star } from "lucide-react";
import storeImg from "@/assets/store.jpg";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit Us — ETERNITY Ooty Boutique" },
      {
        name: "description",
        content:
          "Find us at Bharathiyar Complex, Ooty. Open 9 am Closes 10:30 pm. Call, WhatsApp, or write a Google Maps review.",
      },
      { property: "og:title", content: "Visit ETERNITY — Ooty" },
      {
        property: "og:description",
        content: "Our boutique on Bharathiyar Complex, Ooty. Stop by for a hot chocolate.",
      },
    ],
  }),
  component: Visit,
});

function Visit() {
  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        <img
          src={storeImg}
          alt="The ETERNITY boutique storefront in Ooty"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-[oklch(0.18_0.03_45/0.5)] to-transparent" />
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
              lines: ["no 7,8, bharathiyar complex, charring. cross", "Upper Bazar, Ooty", "Tamil Nadu 643001"],
            },
            { Icon: Clock, label: "Hours", lines: ["Open", "9:00 am – 10:30 pm"] },
            { Icon: Phone, label: "Call us", lines: ["084894 62100"] },
            { Icon: Mail, label: "Email", lines: ["hello@eternity.in"] },
          ].map(({ Icon, label, lines }) => (
            <div key={label} className="rounded-3xl glass p-6 shadow-soft flex gap-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold shrink-0 shadow-gold">
                <Icon className="h-5 w-5 text-[oklch(0.22_0.035_50)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">{label}</p>
                {lines.map((l) => (
                  <p key={l} className="text-foreground leading-relaxed">
                    {l}
                  </p>
                ))}
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
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer noopener"
              className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <Facebook className="h-4 w-4" />
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
            href="https://www.google.com/maps/search/?api=1&query=Eternity+Supper+Market+Charing+Cross+Ooty"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-gold px-8 py-4 text-[oklch(0.22_0.035_50)] font-semibold shadow-gold hover:-translate-y-0.5 transition-all"
          >
            <Star className="h-5 w-5 fill-current" /> Write a Review
          </a>
        </div>
      </section>

      {/* MAP */}
      <section className="container mx-auto px-6">
        <div className="rounded-3xl overflow-hidden shadow-luxe border border-border">
          <iframe
            title="ETERNITY location, Ooty"
            src="https://maps.google.com/maps?q=Eternity,+no+7,8,+bharathiyar+complex,+charring.+cross,+Upper+Bazar,+Ooty,+Tamil+Nadu+643001&t=&z=17&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[460px] block"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
