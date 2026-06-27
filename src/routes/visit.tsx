import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle, Mail, Send, Star, Loader2 } from "lucide-react";
import storeImg from "@/assets/store.jpg";
import { useState } from "react";
import { submitFeedback } from "@/lib/server-functions";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit Us — ETERNITY Ooty Boutique" },
      {
        name: "description",
        content:
          "Find us at Bharathiyar Complex, Ooty. Open 9 am Closes 10:30 pm. Call, WhatsApp, or send us a note.",
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
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {/* INQUIRY/FEEDBACK FORM */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (isSubmitting) return;
            setIsSubmitting(true);
            try {
              const res = await submitFeedback({
                name,
                email,
                rating,
                message,
              });
              if (res.success) {
                setSent(true);
              }
            } catch (err: any) {
              alert(`Failed to submit feedback: ${err.message}`);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="rounded-3xl bg-card p-8 md:p-10 shadow-luxe"
        >
          <h2 className="font-display text-3xl mb-2">Send a note.</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Submit your feedback, custom enquiries, or review of our chocolate boutique.
          </p>

          {sent ? (
            <div className="rounded-2xl bg-secondary p-8 text-center border border-border">
              <p className="font-display text-2xl gold-text">Thank you.</p>
              <p className="text-sm text-muted-foreground mt-2">We appreciate your feedback and will write back if required!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Star Rating Select */}
              <div className="flex flex-col gap-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your Rating</span>
                <div className="flex text-accent gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starValue = i + 1;
                    const active = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-0.5 transition-transform hover:scale-110"
                        aria-label={`Rate ${starValue} stars`}
                      >
                        <Star className={`h-6 w-6 ${active ? "fill-current" : "text-muted/30"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="msg"
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Message
                </label>
                <textarea
                  id="msg"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts about ETERNITY..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 font-medium hover:opacity-90 transition-opacity shadow-soft disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
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
