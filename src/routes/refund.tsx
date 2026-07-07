import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — ETERNITY" },
      {
        name: "description",
        content: "Refund and cancellation guidelines for ETERNITY artisan chocolates.",
      },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Legal Policy</p>
        <h1 className="font-display text-5xl md:text-6xl text-balance max-w-3xl mx-auto">
          Refund & Cancellation
        </h1>
        <p className="mt-4 text-muted-foreground text-sm">Last Updated: July 2026</p>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed">
          <p>
            Thank you for shopping at <strong>ETERNITY</strong>. Because our products are handcrafted food items, we maintain clear guidelines regarding returns, cancellations, and refunds to ensure a fair and safe experience.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. Cancellation Policy</h2>
            <p>
              You can request an order cancellation and receive a full refund only if the order has <strong>not yet been shipped</strong>.
            </p>
            <p>
              Once a package is handed over to our courier partner and a tracking number is generated, the order cannot be cancelled or recalled due to the perishable nature of artisan chocolates. To cancel an order before shipping, please contact us immediately at <strong>084894 62100</strong> or email us at <strong>eternitychocolateooty@gmail.com</strong> with your Order ID.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. Returns Policy</h2>
            <p>
              Because our chocolates, teas, coffees, and spices are food products, we <strong>cannot accept physical returns</strong> of any delivered items due to hygiene, quality assurance, and health safety regulations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Damaged, Defective, or Incorrect Items</h2>
            <p>
              We pack our chocolates using temperature-controlled packaging materials to ensure they reach you in perfect condition. In the rare event that your items arrive severely damaged, melted, or if you receive the wrong product:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Please contact us within <strong>24 hours of delivery</strong>.</li>
              <li>You must provide visual proof (photographs or an unboxing video) showing the condition of the package and the products.</li>
              <li>Once verified by our support team, we will happily arrange for a <strong>free replacement shipment</strong> or process a <strong>full refund</strong> for the damaged items.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Refund Processing</h2>
            <p>
              If a refund is approved:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The refund will be processed back to your **original payment source** (such as the debit/credit card, UPI, net banking, or wallet used during purchase).</li>
              <li>Refunds are initiated immediately upon approval and typically reflect in your account within <strong>5 to 7 business days</strong>, depending on your bank or payment card issuer.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Get in Touch</h2>
            <p>
              If you have any questions or need assistance with an order, refund, or replacement, please contact us at:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li><strong>Email:</strong> eternitychocolateooty@gmail.com</li>
              <li><strong>Phone:</strong> 084894 62100</li>
              <li><strong>Address:</strong> No 7,8, Bharathiyar Complex, Charring Cross, Upper Bazar, Ooty, Tamil Nadu 643001</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
