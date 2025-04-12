'use client'
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CertificateOnboardingForm } from "./CertificateOnboardingForm"

interface CertificateOnboardingModalProps {
  teamId: string;
  teamApplications: string[];
}

export function CertificateOnboardingModal({ 
  teamId,
  teamApplications 
}: CertificateOnboardingModalProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Onboard New Certificate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Certificate from CertaaS</DialogTitle>
        </DialogHeader>
        <CertificateOnboardingForm 
          teamId={teamId}
          teamApplications={teamApplications}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}