"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Application } from "@/db/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ViewApplicationModalProps {
  application: Application
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewApplicationModal({
  application,
  open,
  onOpenChange,
}: ViewApplicationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{application.name}</span>
                <Badge variant={application.isActive ? "default" : "secondary"}>
                  {application.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    CAR ID
                  </p>
                  <p>{application.carid}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    TLA
                  </p>
                  <p>{application.tla}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tier
                  </p>
                  <p>{application.tier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact Email
                  </p>
                  <p>{application.contactEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engineering Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Engineering Director
                  </p>
                  <p>{application.engineeringDirector}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Engineering VP
                  </p>
                  <p>{application.engineeringVP}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Production Director
                  </p>
                  <p>{application.productionDirector}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Production VP
                  </p>
                  <p>{application.productionVP}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {application.snowGroup && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      SNOW Group
                    </p>
                    <p>{application.snowGroup}</p>
                  </div>
                )}
                {application.slack && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Slack
                    </p>
                    <p>{application.slack}</p>
                  </div>
                )}
                {application.confluence && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Confluence
                    </p>
                    <p>{application.confluence}</p>
                  </div>
                )}
              </div>

              {application.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap">{application.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p>
                    {format(new Date(application.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </p>
                  <p>
                    {format(new Date(application.updatedAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created By
                  </p>
                  <p>{application.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated By
                  </p>
                  <p>{application.updatedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 