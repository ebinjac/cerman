"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ServiceIdOnboardingForm } from "./ServiceIdOnboardingForm"


interface ServiceIdOnboardingModalProps {
  teamId: string
  teamApplications: string[]
}

export function ServiceIdOnboardingModal({
  teamId,
  teamApplications,
}: ServiceIdOnboardingModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Service ID</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Service ID</DialogTitle>
        </DialogHeader>
        <ServiceIdOnboardingForm
          teamId={teamId}
          teamApplications={teamApplications}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 