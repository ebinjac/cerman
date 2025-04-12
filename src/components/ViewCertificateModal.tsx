"use client"

import type React from "react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Certificate } from "@/db/schema"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Globe,
  Lock,
  Check,
  Key,
  Calendar,
  X,
  Shield,
  Server,
  AlertCircle,
  User,
  Tag,
  Users,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ViewCertificateModalProps {
  certificate: Certificate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewCertificateModal({ certificate, open, onOpenChange }: ViewCertificateModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!certificate) return null

  const validTo = new Date(certificate.validTo)
  const today = new Date()
  const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getStatusInfo = () => {
    if (daysRemaining < 0) {
      return {
        status: "Expired",
        variant: "destructive" as const,
        icon: <XCircle className="h-4 w-4" />,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      }
    } else if (daysRemaining <= 30) {
      return {
        status: "Critical",
        variant: "destructive" as const,
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      }
    } else if (daysRemaining <= 90) {
      return {
        status: "Expiring Soon",
        variant: "warning" as const,
        icon: <Clock className="h-4 w-4" />,
        color: "text-amber-600 dark:text-amber-500",
        bgColor: "bg-amber-500/10",
      }
    } else {
      return {
        status: "Valid",
        variant: "success" as const,
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-emerald-600 dark:text-emerald-500",
        bgColor: "bg-emerald-500/10",
      }
    }
  }

  const statusInfo = getStatusInfo()

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{certificate.commonName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {certificate.serialNumber && (
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  <span className="font-mono">{certificate.serialNumber}</span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={statusInfo.variant as "default" | "destructive" | "outline" | "secondary"}
              className={cn("px-2 py-1 flex items-center gap-1.5", statusInfo.color, statusInfo.bgColor)}
            >
              {statusInfo.icon}
              <span>
                {statusInfo.status} {daysRemaining > 0 ? `(${daysRemaining} days)` : ""}
              </span>
            </Badge>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem
                  icon={<Globe className="h-4 w-4" />}
                  label="Common Name"
                  value={certificate.commonName}
                  onCopy={copyToClipboard}
                  fieldId="common-name"
                  copiedField={copiedField}
                />
                <DetailItem
                  icon={<Check className="h-4 w-4" />}
                  label="Serial Number"
                  value={certificate.serialNumber}
                  onCopy={copyToClipboard}
                  fieldId="serial-number"
                  copiedField={copiedField}
                />
                <DetailItem
                  icon={<Key className="h-4 w-4" />}
                  label="Certificate ID"
                  value={certificate.certificateIdentifier}
                  onCopy={copyToClipboard}
                  fieldId="cert-id"
                  copiedField={copiedField}
                />
                <DetailItem
                  icon={<Shield className="h-4 w-4" />}
                  label="Purpose"
                  value={certificate.certificatePurpose}
                />
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Validity Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Valid From"
                  value={format(new Date(certificate.validFrom), "MMM dd, yyyy")}
                />
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Valid To"
                  value={format(validTo, "MMM dd, yyyy")}
                />
                <DetailItem
                  icon={daysRemaining < 0 ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  label="Days Remaining"
                  value={daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
                  className={
                    daysRemaining < 0
                      ? "text-destructive"
                      : daysRemaining <= 30
                        ? "text-destructive"
                        : daysRemaining <= 90
                          ? "text-amber-600 dark:text-amber-500"
                          : ""
                  }
                />
                <DetailItem icon={<Lock className="h-4 w-4" />} label="Status" value={certificate.certificateStatus} />
              </div>
            </div>

            {/* Issuer Details */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Issuer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem
                  icon={<Lock className="h-4 w-4" />}
                  label="Issuer CA"
                  value={certificate.issuerCertAuthName}
                />
                <DetailItem icon={<Server className="h-4 w-4" />} label="TA Client" value={certificate.taClientName} />
                <DetailItem icon={<Globe className="h-4 w-4" />} label="Environment" value={certificate.environment} />
                <DetailItem
                  icon={<AlertCircle className="h-4 w-4" />}
                  label="Revoke ID"
                  value={certificate.revokeRequestId}
                  onCopy={copyToClipboard}
                  fieldId="revoke-id"
                  copiedField={copiedField}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Certificate Information */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Certificate Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem
                  icon={<Key className="h-4 w-4" />}
                  label="Application ID"
                  value={certificate.applicationId}
                  onCopy={copyToClipboard}
                  fieldId="app-id"
                  copiedField={copiedField}
                />
                <DetailItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Request ID"
                  value={certificate.requestId}
                  onCopy={copyToClipboard}
                  fieldId="request-id"
                  copiedField={copiedField}
                />
                <DetailItem icon={<Server className="h-4 w-4" />} label="Server Name" value={certificate.serverName} />
              </div>
            </div>

            {/* Ownership */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Ownership
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem icon={<User className="h-4 w-4" />} label="Created By" value={certificate.createdBy} />
                <DetailItem
                  icon={<Check className="h-4 w-4" />}
                  label="Approved By"
                  value={certificate.approvedByUser}
                />
                <DetailItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Team ID"
                  value={certificate.teamId}
                  onCopy={copyToClipboard}
                  fieldId="team-id"
                  copiedField={copiedField}
                />
                <DetailItem
                  icon={<Users className="h-4 w-4" />}
                  label="Hosting Team"
                  value={certificate.hostingTeamName}
                />
              </div>
            </div>

            {/* Subject Alternate Names */}
            {certificate.subjectAlternateNames &&
              Array.isArray(certificate.subjectAlternateNames) &&
              certificate.subjectAlternateNames.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Subject Alternate Names
                  </h3>
                  <div className="bg-muted/40 p-3 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {certificate.subjectAlternateNames.map((name: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-sm">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface DetailItemProps {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
  className?: string
  onCopy?: (text: string, field: string) => void
  fieldId?: string
  copiedField?: string | null
}

function DetailItem({ icon, label, value, className, onCopy, fieldId, copiedField }: DetailItemProps) {
  const canCopy = onCopy && fieldId && value

  return (
    <div className={cn("flex items-start gap-2 p-2 bg-muted/40 rounded-md", className)}>
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="truncate">{value || "-"}</span>
          {canCopy && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={() => onCopy(value, fieldId)}
              title={copiedField === fieldId ? "Copied!" : "Copy to clipboard"}
            >
              {copiedField === fieldId ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
