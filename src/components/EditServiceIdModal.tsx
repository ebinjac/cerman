"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { EditServiceIdForm } from "./EditServiceIdForm"

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

interface EditServiceIdModalProps {
  serviceId: ServiceId
  teamApplications: string[]
  onSuccess?: () => void
}

export function EditServiceIdModal({
  serviceId,
  teamApplications,
  onSuccess,
}: EditServiceIdModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenuItem 
        onClick={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service ID</DialogTitle>
          </DialogHeader>
          <EditServiceIdForm
            serviceId={serviceId}
            teamApplications={teamApplications}
            onSuccess={() => {
              setOpen(false)
              onSuccess?.()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 