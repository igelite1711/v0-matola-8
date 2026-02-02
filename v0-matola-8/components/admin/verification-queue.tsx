/**
 * Admin Verification Queue Component
 * PRD Requirements: Section 6.3 - Manual verification by support team
 * 
 * Displays and manages verification requests from users
 * Supports ID verification, vehicle verification, and union verification
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    Truck,
    Building2,
    AlertCircle,
    Search,
    Filter,
} from "lucide-react"

// Types per PRD verification levels
type VerificationType = "identity" | "vehicle" | "union" | "platform"
type VerificationStatus = "pending" | "approved" | "rejected" | "needs_info"

interface VerificationRequest {
    id: string
    userId: string
    userName: string
    userPhone: string
    userRole: "shipper" | "transporter"
    type: VerificationType
    status: VerificationStatus
    documents: {
        type: string
        url: string
        uploadedAt: string
    }[]
    faceMatchConfidence?: number
    submittedAt: string
    hoursWaiting: number
    notes?: string
}

interface VerificationQueueProps {
    className?: string
}

// Mock data for demonstration (replace with API call)
const mockVerifications: VerificationRequest[] = [
    {
        id: "ver_001",
        userId: "user_123",
        userName: "John Banda",
        userPhone: "+265991234567",
        userRole: "transporter",
        type: "identity",
        status: "pending",
        documents: [
            { type: "national_id_front", url: "/docs/id_front.jpg", uploadedAt: "2024-12-06T10:00:00Z" },
            { type: "national_id_back", url: "/docs/id_back.jpg", uploadedAt: "2024-12-06T10:01:00Z" },
            { type: "selfie", url: "/docs/selfie.jpg", uploadedAt: "2024-12-06T10:02:00Z" },
        ],
        faceMatchConfidence: 72,
        submittedAt: "2024-12-06T10:00:00Z",
        hoursWaiting: 14,
    },
    {
        id: "ver_002",
        userId: "user_456",
        userName: "Grace Phiri",
        userPhone: "+265881234567",
        userRole: "transporter",
        type: "vehicle",
        status: "pending",
        documents: [
            { type: "vehicle_registration", url: "/docs/reg.jpg", uploadedAt: "2024-12-06T08:00:00Z" },
            { type: "vehicle_photo_front", url: "/docs/truck_front.jpg", uploadedAt: "2024-12-06T08:01:00Z" },
            { type: "vehicle_photo_rear", url: "/docs/truck_rear.jpg", uploadedAt: "2024-12-06T08:02:00Z" },
            { type: "insurance", url: "/docs/insurance.jpg", uploadedAt: "2024-12-06T08:03:00Z" },
        ],
        submittedAt: "2024-12-06T08:00:00Z",
        hoursWaiting: 16,
    },
    {
        id: "ver_003",
        userId: "user_789",
        userName: "Patrick Mwanza",
        userPhone: "+265999876543",
        userRole: "transporter",
        type: "union",
        status: "pending",
        documents: [
            { type: "union_card", url: "/docs/union.jpg", uploadedAt: "2024-12-06T12:00:00Z" },
        ],
        submittedAt: "2024-12-06T12:00:00Z",
        hoursWaiting: 12,
        notes: "MTA membership #12345",
    },
]

export function VerificationQueue({ className }: VerificationQueueProps) {
    const [verifications, setVerifications] = useState<VerificationRequest[]>(mockVerifications)
    const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<VerificationType | "all">("all")
    const [reviewNotes, setReviewNotes] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Filter verifications
    const filteredVerifications = verifications.filter((v) => {
        const matchesSearch =
            v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.userPhone.includes(searchQuery)
        const matchesType = filterType === "all" || v.type === filterType
        return matchesSearch && matchesType
    })

    // Count by status
    const counts = {
        pending: verifications.filter((v) => v.status === "pending").length,
        approved: verifications.filter((v) => v.status === "approved").length,
        rejected: verifications.filter((v) => v.status === "rejected").length,
        needsInfo: verifications.filter((v) => v.status === "needs_info").length,
    }

    const openReviewModal = (verification: VerificationRequest) => {
        setSelectedVerification(verification)
        setReviewNotes("")
        setIsReviewModalOpen(true)
    }

    const handleApprove = async () => {
        if (!selectedVerification) return
        setIsProcessing(true)

        try {
            // API call would go here
            // await fetch(`/api/admin/verifications/${selectedVerification.id}/approve`, {
            //   method: 'POST',
            //   body: JSON.stringify({ notes: reviewNotes })
            // })

            setVerifications((prev) =>
                prev.map((v) =>
                    v.id === selectedVerification.id
                        ? { ...v, status: "approved" as VerificationStatus }
                        : v
                )
            )
            setIsReviewModalOpen(false)
        } catch (error) {
            console.error("Error approving verification:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!selectedVerification || !reviewNotes.trim()) {
            alert("Please provide a reason for rejection")
            return
        }
        setIsProcessing(true)

        try {
            // API call would go here
            setVerifications((prev) =>
                prev.map((v) =>
                    v.id === selectedVerification.id
                        ? { ...v, status: "rejected" as VerificationStatus, notes: reviewNotes }
                        : v
                )
            )
            setIsReviewModalOpen(false)
        } catch (error) {
            console.error("Error rejecting verification:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRequestInfo = async () => {
        if (!selectedVerification || !reviewNotes.trim()) {
            alert("Please specify what information is needed")
            return
        }
        setIsProcessing(true)

        try {
            // API call would go here
            setVerifications((prev) =>
                prev.map((v) =>
                    v.id === selectedVerification.id
                        ? { ...v, status: "needs_info" as VerificationStatus, notes: reviewNotes }
                        : v
                )
            )
            setIsReviewModalOpen(false)
        } catch (error) {
            console.error("Error requesting info:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const getTypeIcon = (type: VerificationType) => {
        switch (type) {
            case "identity":
                return <User className="h-4 w-4" />
            case "vehicle":
                return <Truck className="h-4 w-4" />
            case "union":
                return <Building2 className="h-4 w-4" />
            default:
                return <CheckCircle className="h-4 w-4" />
        }
    }

    const getTypeLabel = (type: VerificationType) => {
        switch (type) {
            case "identity":
                return "Identity (Level 2)"
            case "vehicle":
                return "Vehicle (Level 3)"
            case "union":
                return "Union (Level 4)"
            case "platform":
                return "Platform (Level 5)"
        }
    }

    const getStatusBadge = (status: VerificationStatus) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
            case "approved":
                return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>
            case "rejected":
                return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
            case "needs_info":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700"><AlertCircle className="h-3 w-3 mr-1" /> Needs Info</Badge>
        }
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Verification Queue
                    </CardTitle>
                    <CardDescription>
                        Review and process user verification requests (PRD Section 6.3)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
                                <p className="text-xs text-muted-foreground">Pending Review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
                                <p className="text-xs text-muted-foreground">Approved Today</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
                                <p className="text-xs text-muted-foreground">Rejected</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-blue-600">{counts.needsInfo}</div>
                                <p className="text-xs text-muted-foreground">Needs Info</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as VerificationType | "all")}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="identity">Identity</TabsTrigger>
                                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                                <TabsTrigger value="union">Union</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Verification List */}
                    <div className="space-y-3">
                        {filteredVerifications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No verification requests match your filters
                            </div>
                        ) : (
                            filteredVerifications.map((verification) => (
                                <Card key={verification.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    {getTypeIcon(verification.type)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{verification.userName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {verification.userPhone} · {getTypeLabel(verification.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {verification.hoursWaiting > 24 && (
                                                    <Badge variant="destructive" className="animate-pulse">
                                                        ⚠️ {verification.hoursWaiting}h waiting
                                                    </Badge>
                                                )}
                                                {verification.faceMatchConfidence && verification.faceMatchConfidence < 80 && (
                                                    <Badge variant="outline" className="bg-yellow-50">
                                                        Face: {verification.faceMatchConfidence}%
                                                    </Badge>
                                                )}
                                                {getStatusBadge(verification.status)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openReviewModal(verification)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-muted-foreground">
                                            Documents: {verification.documents.map((d) => d.type).join(", ")}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Review Modal */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Review Verification Request</DialogTitle>
                        <DialogDescription>
                            {selectedVerification && (
                                <>
                                    {selectedVerification.userName} - {getTypeLabel(selectedVerification.type)}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedVerification && (
                        <div className="space-y-4">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <p>{selectedVerification.userName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p>{selectedVerification.userPhone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <p className="capitalize">{selectedVerification.userRole}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Submitted</label>
                                    <p>{new Date(selectedVerification.submittedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Face Match Warning */}
                            {selectedVerification.faceMatchConfidence && selectedVerification.faceMatchConfidence < 85 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="font-medium">Low Face Match Confidence: {selectedVerification.faceMatchConfidence}%</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Please carefully compare the selfie with the ID photo before approving.
                                    </p>
                                </div>
                            )}

                            {/* Documents */}
                            <div>
                                <label className="text-sm font-medium">Documents</label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {selectedVerification.documents.map((doc, idx) => (
                                        <div key={idx} className="border rounded-lg p-2 text-center">
                                            <div className="bg-gray-100 h-24 rounded flex items-center justify-center mb-1">
                                                <span className="text-xs text-gray-500">[{doc.type}]</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium">Review Notes</label>
                                <Textarea
                                    placeholder="Add notes (required for rejection or info request)..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRequestInfo}
                            disabled={isProcessing}
                        >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Request Info
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default VerificationQueue
