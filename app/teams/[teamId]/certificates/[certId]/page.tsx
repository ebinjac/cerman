import React from "react"
import { getCertificateById } from "@/src/app/actions"
import { format } from "date-fns"
import {
  Calendar,
  Check,
  FileText,
  Globe,
  Key,
  Lock,
  Shield,
  Tag,
  User,
  Users,
  X,
  Server,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function CertificateDetails({
  params
}: {
  params: { teamId: string; certId: string }
}) {
  try {
    const certificate = await getCertificateById(params.certId)
    const daysRemaining = Math.ceil(
      (certificate.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return (
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{certificate.commonName}</h1>
              <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
                <span className="flex items-center gap-1.5 text-sm">
                  <Tag className="h-3.5 w-3.5" />
                  {certificate.serialNumber}
                </span>
                <Badge variant={daysRemaining < 30 ? "destructive" : "default"} className="text-sm">
                  {daysRemaining > 0 ? `${daysRemaining}d remaining` : "Expired"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Certificate Information */}
          <Section title="Certificate Information" icon={<FileText />}>
            <DetailGrid>
              <DetailItem icon={<Globe className="h-4 w-4" />} label="Environment" value={certificate.environment} />
              <DetailItem icon={<Lock className="h-4 w-4" />} label="Status" value={certificate.certificateStatus} />
              <DetailItem icon={<Check className="h-4 w-4" />} label="Purpose" value={certificate.certificatePurpose} />
              <DetailItem icon={<Key className="h-4 w-4" />} label="Certificate ID" value={certificate.certificateIdentifier} />
            </DetailGrid>
          </Section>

          {/* Validity Period */}
          <Section title="Validity Period" icon={<Calendar />}>
            <DetailGrid>
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Valid From" value={format(certificate.validFrom, "MMM dd, yyyy")} />
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Valid To" value={format(certificate.validTo, "MMM dd, yyyy")} />
              {certificate.revokeDate && (
                <DetailItem icon={<X className="h-4 w-4" />} label="Revoked On" value={format(certificate.revokeDate, "MMM dd, yyyy")} />
              )}
            </DetailGrid>
          </Section>

          {/* Issuer Details */}
          <Section title="Issuer Details" icon={<Shield className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem icon={<Lock className="h-4 w-4" />} label="Issuer CA" value={certificate.issuerCertAuthName} />
              <DetailItem icon={<Server className="h-4 w-4" />} label="TA Client" value={certificate.taClientName} />
              <DetailItem icon={<AlertCircle className="h-4 w-4" />} label="Revoke ID" value={certificate.revokeRequestId} />
            </DetailGrid>
          </Section>

          {/* Ownership */}
          <Section title="Ownership" icon={<Users className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem icon={<User className="h-4 w-4" />} label="Created By" value={certificate.createdBy} />
              <DetailItem icon={<Check className="h-4 w-4" />} label="Approved By" value={certificate.approvedByUser} />
              <DetailItem icon={<Tag className="h-4 w-4" />} label="Team ID" value={certificate.teamId} />
              <DetailItem icon={<Users className="h-4 w-4" />} label="Hosting Team" value={certificate.hostingTeamName} />
            </DetailGrid>
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information" icon={<AlertCircle className="h-4 w-4" />}>
            <div className="grid gap-4">
              <DetailGrid>
                <DetailItem icon={<Key className="h-4 w-4" />} label="Application ID" value={certificate.applicationId} />
                <DetailItem icon={<FileText className="h-4 w-4" />} label="Request ID" value={certificate.requestId} />
              </DetailGrid>
              
              <div className="space-y-3">
                <LabelWithIcon icon={<Globe className="h-4 w-4" />} text="Subject Alternate Names" />
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(certificate.subjectAlternateNames) ? certificate.subjectAlternateNames : [])?.map((name, i) => (
                    <Badge key={i} variant="outline" className="text-sm">{name}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <LabelWithIcon icon={<Server className="h-4 w-4" />} text="Associated Devices" />
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(certificate.devices) ? certificate.devices : [])?.map((device, i) => (
                    <Badge key={i} variant="outline" className="text-sm">{device}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <LabelWithIcon icon={<AlertCircle className="h-4 w-4" />} text="Agent Vault Certificates" />
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(certificate.agentVaultCerts) ? certificate.agentVaultCerts : [])?.map((cert, i) => (
                    <Badge key={i} variant="outline" className="text-sm">{cert}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    )
  } catch (error) {
    // Error state remains same
  }
}

// Updated Section component
function Section({ title, icon, children }: { 
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xl font-semibold border-b pb-2 mb-2">
        <span className="text-muted-foreground inline-flex items-center justify-center w-5 h-5">
          {icon}
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}

// Updated DetailItem component
function DetailItem({ icon, label, value }: { 
  icon: React.ReactNode
  label: string
  value?: string | number | null
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground mb-0.5">{label}</p>
        <p className="font-medium text-base">{value || '-'}</p>
      </div>
    </div>
  )
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  )
}

function LabelWithIcon({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  )
}
