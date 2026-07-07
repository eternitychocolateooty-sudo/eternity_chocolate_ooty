import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — ETERNITY" },
      {
        name: "description",
        content: "Terms and conditions for purchasing artisan chocolates from ETERNITY.",
      },
    ],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Legal Policy</p>
        <h1 className="font-display text-5xl md:text-6xl text-balance max-w-3xl mx-auto">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-muted-foreground text-sm">Last Updated: July 2026</p>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed">
          <p>
            Welcome to <strong>ETERNITY</strong>. These Terms & Conditions govern your use of our
            website, including any purchases made from our online boutique. By accessing or using our website, you agree to comply with and be bound by these terms.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. General Information</h2>
            <p>
              This website is owned and operated by <strong>ETERNITY Artisan Chocolate Boutique</strong>,
              located at No 7,8, Bharathiyar Complex, Charring Cross, Upper Bazar, Ooty, Tamil Nadu 643001. All orders and purchases made through this website are subject to these Terms & Conditions.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. Products & Pricing</h2>
            <p>
              We strive to represent our handcrafted artisan chocolates, spices, teas, and coffees as accurately as possible. However, because our chocolates are made in small batches, slight variations in appearance, weight, and packaging may occur.
            </p>
            <p>
              All prices listed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Shipping charges will be calculated and displayed during the checkout process. We reserve the right to change our prices at any time without prior notice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Orders & Payment</h2>
            <p>
              By placing an order, you make an offer to purchase the selected products under these terms. We reserve the right to accept or decline any order for any reason, including stock availability or issues with payment processing.
            </p>
            <p>
              All payments must be made in full at the time of checkout. We use secure third-party payment gateways (such as Paytm PG/Cashfree) to process transactions. We do not store or have access to your raw credit/debit card details or authentication credentials.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Shipping & Delivery</h2>
            <p>
              We ship our products across India. We pack our handcrafted chocolates carefully using temperature-insulated materials to prevent melting during transit. However, we are not liable for transit delays caused by courier services, weather conditions, or incorrect shipping addresses provided by the customer.
            </p>
            <p>
              Delivery timelines are estimates and not guaranteed. If a package arrives damaged, please document the damage (photos/videos) and contact us immediately within 24 hours of delivery.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, graphics, and software, is the property of ETERNITY and is protected by Indian and international copyright laws. You may not reproduce, distribute, or display any content from this site without our express written permission.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">6. Governing Law</h2>
            <p>
              These Terms & Conditions and any transactions executed through this website are governed by the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Ooty, Tamil Nadu.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">7. Contact Information</h2>
            <p>
              If you have any questions, feedback, or concerns regarding these Terms & Conditions, please reach out to us at:
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
