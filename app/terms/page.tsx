import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="mt-4 text-muted-foreground">Last updated: December 1, 2024</p>

            <div className="prose prose-invert mt-8 max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Matola platform ("Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Matola provides a digital platform connecting shippers (individuals or businesses needing to transport
                goods) with transporters (licensed vehicle operators). We facilitate the matching, communication, and
                payment processes but are not ourselves a transportation company.
              </p>

              <h2>3. User Accounts</h2>
              <p>To use our Service, you must:</p>
              <ul>
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2>4. Transporter Requirements</h2>
              <p>Transporters using our platform must:</p>
              <ul>
                <li>Hold a valid driver's license appropriate for their vehicle</li>
                <li>Maintain current vehicle registration and road worthiness certification</li>
                <li>Carry appropriate insurance coverage</li>
                <li>Complete RTOA verification through our platform</li>
                <li>Comply with all applicable Malawian transport regulations</li>
              </ul>

              <h2>5. Shipper Responsibilities</h2>
              <p>Shippers using our platform must:</p>
              <ul>
                <li>Provide accurate descriptions of goods to be transported</li>
                <li>Ensure goods are legal and safe for transport</li>
                <li>Not ship prohibited items (weapons, drugs, hazardous materials without proper authorization)</li>
                <li>Pay for services as agreed through our platform</li>
              </ul>

              <h2>6. Payments and Fees</h2>
              <p>
                All payments are processed through our secure escrow system. Matola charges a service fee of 8% on
                completed transactions. Funds are released to transporters upon delivery confirmation.
              </p>

              <h2>7. Cancellations and Refunds</h2>
              <ul>
                <li>Free cancellation up to 2 hours before pickup</li>
                <li>50% charge for cancellations within 2 hours of pickup</li>
                <li>Full charge if transporter arrives and cargo is not available</li>
                <li>Disputes will be handled through our resolution process</li>
              </ul>

              <h2>8. Limitation of Liability</h2>
              <p>
                Matola acts as an intermediary platform. While we verify transporters and provide insurance coverage, we
                are not liable for damages beyond the terms of our cargo insurance policy. Maximum liability is limited
                to the declared value of goods.
              </p>

              <h2>9. Dispute Resolution</h2>
              <p>
                Disputes should first be reported through our in-app dispute system. If not resolved, disputes will be
                handled through arbitration under Malawian law.
              </p>

              <h2>10. Privacy</h2>
              <p>
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . By using Matola, you consent to the collection and use of information as described therein.
              </p>

              <h2>11. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Service after changes
                constitutes acceptance of the modified terms.
              </p>

              <h2>12. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
                <a href="mailto:legal@matola.mw" className="text-primary hover:underline">
                  legal@matola.mw
                </a>{" "}
                or through our{" "}
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
