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
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 max-w-3xl">
        <div className="prose prose-invert max-w-none space-y-8 text-[oklch(0.94_0.02_80/0.8)] leading-relaxed text-left">
          <p>
            At <strong>Eternity</strong>,{" "}
            <a
              href="https://eternitychocolateooty.in/"
              className="text-accent underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              https://eternitychocolateooty.in/
            </a>
            , we value your privacy and are committed to safeguarding your personal information. This
            Privacy Policy outlines how we collect, use, disclose, and protect your data when you
            visit or make a purchase from our website.
          </p>
          <p>By using our website, you agree to the terms described in this policy.</p>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">1. Information We Collect</h2>
            <p>To provide a seamless shopping experience, we may collect the following types of information:</p>
            
            <h3 className="font-display text-lg text-foreground mt-4 font-semibold">a) Personal Information</h3>
            <p>When you interact with our website (place orders, sign up, or contact us), we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Shipping & Billing Address</li>
              <li>Payment Details (processed securely via third-party gateways)</li>
            </ul>

            <h3 className="font-display text-lg text-foreground mt-4 font-semibold">b) Non-Personal Information</h3>
            <p>We may automatically collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP Address</li>
              <li>Browser Type & Device Information</li>
              <li>Pages Visited and Time Spent</li>
              <li>Cookies and Usage Data</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">2. How We Use Your Information</h2>
            <p>We use the collected data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and deliver your orders</li>
              <li>To provide customer support and respond to queries</li>
              <li>To send order updates and service-related notifications</li>
              <li>To send promotional emails/offers (you can opt out anytime)</li>
              <li>To improve website performance and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">3. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience. Cookies help us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Remember user preferences</li>
              <li>Analyze website traffic</li>
              <li>Improve functionality</li>
            </ul>
            <p>You can disable cookies anytime through your browser settings.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal data from unauthorized access, misuse, or disclosure.</p>
            <p>However, please note:</p>
            <p className="italic text-muted-foreground">No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl text-foreground mt-8">5. Sharing of Information</h2>
            <p>We do not sell or rent your personal data. However, we may share your information in the following cases:</p>
            
            <h3 className="font-display text-lg text-foreground mt-4 font-semibold">a) Service Providers</h3>
            <p>Trusted third parties (such as payment gateways, logistics partners, and marketing tools) to complete your orders.</p>

            <h3 className="font-display text-lg text-foreground mt-4 font-semibold">b) Legal Requirements</h3>
            <p>If required by law or to protect our legal rights and prevent fraud.</p>
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
            <p className="text-accent font-semibold">Email: a2zsmart2025@gmail.com</p>
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
              <li><strong>Email:</strong> eternitychocolateooty@gmail.com</li>
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
