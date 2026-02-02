/**
 * Admin Verification Queue Page
 * PRD Requirements: Section 6.3 - Support team verification queue
 */

import { VerificationQueue } from "@/components/admin/verification-queue"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Verification Queue | Matola Admin",
    description: "Review and process user verification requests",
}

export default function VerificationQueuePage() {
    return (
        <div className="container mx-auto py-6">
            <VerificationQueue />
        </div>
    )
}
