import { createFileRoute } from "@tanstack/react-router";
import { EmailObfuscator } from "@/components/ui/EmailObfuscator";

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
            At <strong>ETERNITY</strong>, accessible from <a href="https://eternitychocolateooty.in" className="text-accent underline" target="_blank" rel="noreferrer noopener">https://eternitychocolateooty.in</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by ETERNITY and how we use it.
          </p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you make a purchase, create an account, or contact us. This may include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, phone number, and billing/shipping address</li>
              <li>Order details and transaction history</li>
              <li>Google account metadata if you choose to sign in via Google OAuth</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process transactions and send order confirmations/invoices</li>
              <li>Communicate updates, delivery schedules, and support alerts</li>
              <li>Improve and personalize your online shopping experience</li>
              <li>Analyze web traffic metrics to enhance our site performance</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Web Security and Storage</h2>
            <p>We process payments securely via standardized third-party checkout gateways (Cashfree). Your sensitive credit card or UPI details are never stored on our database servers. We use safe, encrypted SSL protocols to transmit user information.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Cookies and Web Beacons</h2>
            <p>Like any other website, ETERNITY uses cookies. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Share of Information</h2>
            <p>We do not share your private contact information or purchase data with unrelated third parties. We share shipping metadata with courier partners solely to enable order delivery.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access or update your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing emails anytime</li>
              <li>Withdraw consent for data usage</li>
            </ul>
            <p>To exercise these rights, contact us at:</p>
            <p className="text-accent font-semibold">Email: <EmailObfuscator /></p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">7. Third-Party Links</h2>
            <p>Our website may include links to third-party websites. We are not responsible for their privacy practices. We recommend reviewing their policies before sharing any personal information.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">8. Children’s Privacy</h2>
            <p>Our website is not intended for individuals under the age of 18. We do not knowingly collect data from children. If such data is identified, it will be deleted promptly.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated Effective Date.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">10. Contact Us</h2>
            <p>If you have any questions or concerns regarding this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li><strong>Email:</strong> <EmailObfuscator /></li>
              <li><strong>Website:</strong> <a href="https://eternitychocolateooty.in" className="text-accent underline" target="_blank" rel="noreferrer noopener">https://eternitychocolateooty.in</a></li>
              <li><strong>Contact:</strong> 8489462100</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-border pt-8 mt-12">
            <h3 className="font-display text-xl text-foreground">Consent</h3>
            <p>By using our website, you consent to this Privacy Policy and agree to its terms.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
