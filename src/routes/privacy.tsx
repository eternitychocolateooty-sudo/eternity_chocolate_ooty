import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ETERNITY" },
      {
        name: "description",
        content: "Privacy policy describing how ETERNITY collects, uses, and secures your information.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Legal Policy</p>
        <h1 className="font-display text-5xl md:text-6xl text-balance max-w-3xl mx-auto">
          Privacy Policy
        </h1>
        <p className="mt-4 text-muted-foreground text-sm">Last Updated: July 2026</p>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed">
          <p>
            At <strong>ETERNITY</strong>, we are committed to safeguarding your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you visit or make a purchase from our website.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. Information We Collect</h2>
            <p>
              When you purchase products or create an account on our website, we collect personal information you provide to us, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact information such as your name, email address, phone number, and shipping/billing addresses.</li>
              <li>Details about the items you add to your shopping cart and your order history.</li>
              <li>IP address and device information generated during your visit to improve our site security and performance.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders, including coordinating shipments and sending order/payment confirmation emails.</li>
              <li>Provide customer support and respond to your inquiries or feedback.</li>
              <li>Prevent fraud, secure our checkout flow, and monitor site usage.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Security of Your Payments</h2>
            <p>
              We prioritize the security of your transactions. All payments processed on our site are secured by SSL encryption. 
            </p>
            <p>
              We partner with trusted, PCI-DSS compliant third-party payment processors (such as Paytm PG/Cashfree) to process payment details. <strong>ETERNITY does not collect, access, or store your raw payment details (such as credit/debit card numbers, CVVs, or bank logins).</strong> All payment transactions are completed entirely within the secure environments of our payment gateway partners.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Sharing Your Information</h2>
            <p>
              We do not sell or lease your personal information to third parties. We only share your details with essential service providers who help us run our business, specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Courier Services:</strong> To deliver physical packages to your address.</li>
              <li><strong>Payment Gateways:</strong> To process secure transactions.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Cookies</h2>
            <p>
              We use cookies to maintain your shopping cart sessions, remember your preferences, and track general site performance metrics. You can manage or disable cookies through your browser settings, though doing so may affect certain features of the site (like the shopping cart).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">6. Contact Us</h2>
            <p>
              If you have any questions or would like to exercise any rights regarding your data, please contact our support team at:
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
