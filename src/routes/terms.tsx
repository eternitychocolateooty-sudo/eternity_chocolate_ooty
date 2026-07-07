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
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed text-left">
          <p>
            Welcome to <strong>Eternity</strong>. By accessing or using our website, you agree to
            comply with and be bound by the following Terms and Conditions. Please read them
            carefully before using our services.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. General</h2>
            <p>
              These Terms & Conditions apply to all users of{" "}
              <a
                href="https://eternitychocolateooty.in/"
                className="text-accent underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                https://eternitychocolateooty.in/
              </a>{" "}
              (referred to as “we,” “us,” or “our”).
            </p>
            <p>
              By using this website, you agree to follow these terms. If you do not agree, please do
              not use our website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. Products and Services</h2>
            <p>We strive to display our products as accurately as possible. However:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All products are subject to availability.</li>
              <li>
                We reserve the right to modify, update, or discontinue any product at any time
                without prior notice.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Pricing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are listed in Indian Rupees (INR).</li>
              <li>Prices are inclusive of applicable taxes unless stated otherwise.</li>
              <li>
                We reserve the right to change pricing, discounts, or offers at any time without
                prior notice.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Orders</h2>
            <p>Once you place an order, you will receive an order confirmation email.</p>
            <p>
              This email is only an acknowledgment and does not guarantee acceptance of the order.
            </p>
            <p>We reserve the right to cancel or refuse any order due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>unavailability</li>
              <li>Pricing errors</li>
              <li>Suspicious or fraudulent activity</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Payment</h2>
            <p>We accept multiple payment methods, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Credit/Debit Cards</li>
              <li>UPI</li>
              <li>Net Banking</li>
              <li>Cash on Delivery (COD) (if available)</li>
            </ul>
            <p>Additional charges may apply for COD orders.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">7. Returns and Refunds</h2>
            <p>
              Please refer to our Return & Refund Policy page for complete details regarding
              eligibility, process, and timelines.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">8. Use of Website</h2>
            <p>You agree not to misuse the website. Prohibited activities include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hacking or unauthorized access</li>
              <li>Spreading malware or viruses</li>
              <li>Spamming or fraudulent activity</li>
            </ul>
            <p>Violation may result in termination of access and legal action.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">9. Intellectual Property</h2>
            <p>All content on this website, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Logos</li>
              <li>Images</li>
              <li>Product designs</li>
              <li>Text and graphics</li>
            </ul>
            <p>
              are the property of <strong>MANOHAR VINOTH YAVANARAJ</strong> and are protected under
              applicable copyright laws.
            </p>
            <p>Unauthorized use or reproduction is strictly prohibited.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">10. Privacy Policy</h2>
            <p>
              Your use of this website is also governed by our Privacy Policy, which explains how we
              collect and use your information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">11. Limitation of Liability</h2>
            <p>Eternity shall not be held liable for any:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Direct or indirect damages</li>
              <li>Loss of data or profits</li>
              <li>Issues arising from the use or inability to use our website or products</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">12. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of India. Any disputes shall be
              subject to the jurisdiction of courts in Tamil Nadu, India.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-8 mt-12">
            <h3 className="font-display text-xl text-foreground">Acceptance of Terms</h3>
            <p>
              By using our website, you confirm that you have read, understood, and agreed to these
              Terms & Conditions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
