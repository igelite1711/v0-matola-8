import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="mt-4 text-muted-foreground">Last updated: December 1, 2024</p>

            <div className="prose prose-invert mt-8 max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
              <h2>1. Information We Collect</h2>
              <p>We collect the following types of information:</p>

              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact details (phone number, email, WhatsApp)</li>
                <li>Government ID for verification (driver's license, national ID)</li>
                <li>Vehicle information for transporters</li>
                <li>Payment information (Mobile Money details)</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>Device information and IP address</li>
                <li>Location data during active shipments</li>
                <li>Transaction history</li>
                <li>Communication records within the platform</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Verify your identity and prevent fraud</li>
                <li>Match shippers with appropriate transporters</li>
                <li>Process payments and maintain transaction records</li>
                <li>Provide real-time tracking of shipments</li>
                <li>Improve our services and develop new features</li>
                <li>Communicate service updates and promotional offers</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>We share your information only:</p>
              <ul>
                <li>Between matched shippers and transporters (limited contact info)</li>
                <li>With payment processors (Airtel Money, TNM Mpamba)</li>
                <li>With verification partners (RTOA)</li>
                <li>When required by law or to protect safety</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>

              <h2>4. Location Data</h2>
              <p>
                For transporters, we collect GPS location data during active trips to enable real-time tracking. This
                data is shared with the shipper for that specific shipment only. Location tracking stops when the trip
                is completed.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate security measures including encryption, secure servers, and access controls.
                However, no system is completely secure, and we cannot guarantee absolute security.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active. Transaction records are kept for 7 years as
                required by Malawian tax law. You may request deletion of your account, subject to legal requirements.
              </p>

              <h2>7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data</li>
              </ul>

              <h2>8. USSD and SMS</h2>
              <p>
                When you use our USSD service (*555#), your mobile operator may process your session data. SMS
                notifications are sent for important updates. Standard messaging rates may apply.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our Service is not intended for users under 18. We do not knowingly collect information from minors.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this policy periodically. We will notify you of significant changes via SMS or app
                notification.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                For privacy questions or to exercise your rights, contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@matola.mw" className="text-primary hover:underline">
                  privacy@matola.mw
                </a>{" "}
                or visit our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
