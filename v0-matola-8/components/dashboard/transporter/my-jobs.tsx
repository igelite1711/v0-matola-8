"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Truck, Package, MapPin, Phone, CheckCircle } from "lucide-react"

interface Job {
  id: string
  origin: string
  destination: string
  shipper: string
  shipperPhone: string
  cargo: string
  weight: string
  price: string
  status: "pickup-scheduled" | "in-transit" | "delivered"
  pickupDate: string
  progress: number
}

const mockJobs: Job[] = [
  {
    id: "JOB-001",
    origin: "Lilongwe",
    destination: "Blantyre",
    shipper: "Banda Trading Co.",
    shipperPhone: "+265 999 111 222",
    cargo: "Agricultural Products",
    weight: "2,500 kg",
    price: "MK 85,000",
    status: "in-transit",
    pickupDate: "Jan 15",
    progress: 65,
  },
  {
    id: "JOB-002",
    origin: "Blantyre",
    destination: "Zomba",
    shipper: "MK Furniture Ltd",
    shipperPhone: "+265 888 333 444",
    cargo: "Furniture",
    weight: "800 kg",
    price: "MK 35,000",
    status: "pickup-scheduled",
    pickupDate: "Jan 17",
    progress: 10,
  },
  {
    id: "JOB-003",
    origin: "Mzuzu",
    destination: "Lilongwe",
    shipper: "Northern Traders",
    shipperPhone: "+265 999 555 666",
    cargo: "Retail Goods",
    weight: "1,500 kg",
    price: "MK 95,000",
    status: "delivered",
    pickupDate: "Jan 10",
    progress: 100,
  },
]

export function MyJobs() {
  const [activeTab, setActiveTab] = useState("active")

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "pickup-scheduled": "bg-chart-4/20 text-chart-4",
      "in-transit": "bg-primary/20 text-primary",
      delivered: "bg-chart-3/20 text-chart-3",
    }
    const labels: Record<string, string> = {
      "pickup-scheduled": "Pickup Scheduled",
      "in-transit": "In Transit",
      delivered: "Delivered",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const activeJobs = mockJobs.filter((j) => j.status !== "delivered")
  const completedJobs = mockJobs.filter((j) => j.status === "delivered")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Jobs</h2>
        <p className="text-muted-foreground">Manage your accepted shipments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeJobs.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-foreground">No active jobs</p>
                <p className="text-sm text-muted-foreground">Find loads to start earning</p>
                <Button className="mt-4">Find Loads</Button>
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => <JobCard key={job.id} job={job} getStatusBadge={getStatusBadge} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedJobs.map((job) => (
            <JobCard key={job.id} job={job} getStatusBadge={getStatusBadge} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function JobCard({
  job,
  getStatusBadge,
}: {
  job: Job
  getStatusBadge: (status: string) => React.ReactNode
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsUpdating(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{job.id}</p>
                {getStatusBadge(job.status)}
              </div>
              <div className="mt-2 flex items-center gap-1 text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {job.origin} → {job.destination}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.cargo} • {job.weight}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Shipper:</span>
                  <span className="font-medium text-foreground">{job.shipper}</span>
                </div>
                <a
                  href={`tel:${job.shipperPhone}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {job.shipperPhone}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <p className="text-2xl font-bold text-primary">{job.price}</p>

            {job.status !== "delivered" && (
              <div className="w-full lg:w-48">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              {job.status === "pickup-scheduled" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Confirm Pickup</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Pickup</DialogTitle>
                      <DialogDescription>Confirm that you have picked up the cargo for {job.id}?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Confirm Pickup"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {job.status === "in-transit" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Complete Delivery
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Delivery</DialogTitle>
                      <DialogDescription>Confirm that you have delivered the cargo for {job.id}?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Confirm Delivery"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {job.status === "delivered" && (
                <div className="flex items-center gap-1 text-sm text-chart-3">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
