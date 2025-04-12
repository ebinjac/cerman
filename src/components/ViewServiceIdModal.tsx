"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ServiceId {
  id: string
  svcid: string
  env: string
  application: string
  expDate: string
  comment: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface ViewServiceIdModalProps {
  serviceId: ServiceId
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewServiceIdModal({
  serviceId,
  open,
  onOpenChange,
}: ViewServiceIdModalProps) {
  const isExpired = new Date(serviceId.expDate) < new Date()
  const isExpiringSoon = new Date(serviceId.expDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Service ID Details
            <Badge
              variant={
                isExpired
                  ? "destructive"
                  : isExpiringSoon
                  ? "secondary"
                  : "default"
              }
            >
              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Valid"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Service ID</h3>
                    <p className="mt-1 text-sm">{serviceId.svcid}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Environment</h3>
                    <p className="mt-1 text-sm">{serviceId.env}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Application</h3>
                    <p className="mt-1 text-sm">{serviceId.application}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Validity Period</h3>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {format(new Date(serviceId.expDate), "PPP")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Additional Information</h3>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="font-medium">
                      {serviceId.comment || "No comments provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {serviceId.createdAt ? format(serviceId.createdAt, "PPP") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {serviceId.updatedAt ? format(serviceId.updatedAt, "PPP") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 