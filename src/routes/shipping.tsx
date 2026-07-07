import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — ETERNITY" },
      {
        name: "description",
        content: "Shipping policy for ETERNITY artisan chocolates, processing timelines, and charges.",
      },
    ],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Legal Policy</p>
        <h1 className="font-display text-5xl md:text-6xl text-balance max-w-3xl mx-auto">
          Shipping Policy
        </h1>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed text-left">
          <p>
            At <strong>Eternity</strong>, we aim to deliver your orders quickly and safely across India.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Shipping Locations</h2>
            <p>We currently ship across all major locations in India.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Processing Time</h2>
            <p>Orders are processed within 1–2 business days after confirmation.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Delivery Time</h2>
            <p>The estimated delivery time is 3–7 business days, depending on your location.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Shipping Charges</h2>
            <p>Shipping charges (if any) will be displayed at checkout before payment.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Order Tracking</h2>
            <p>Once your order is shipped, you will receive tracking details via SMS or email.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">Delays</h2>
            <p>
              Delivery may be delayed due to unforeseen circumstances such as weather, logistics
              issues, or public holidays.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
