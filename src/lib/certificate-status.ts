import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type CertificateStatus = {
  status: "Expired" | "Critical" | "Expiring Soon" | "Valid"
  variant: "destructive" | "warning" | "success" | "default"
  icon: React.ReactNode
  color: string
  bgColor: string
  daysRemaining: number
}

export function calculateCertificateStatus(validTo: Date): CertificateStatus {
  const today = new Date()
  const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) {
    return {
      status: "Expired",
      variant: "destructive",
      icon: <XCircle className="h-4 w-4" />,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      daysRemaining
    }
  } else if (daysRemaining <= 30) {
    return {
      status: "Critical",
      variant: "destructive",
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      daysRemaining
    }
  } else if (daysRemaining <= 90) {
    return {
      status: "Expiring Soon",
      variant: "warning",
      icon: <Clock className="h-4 w-4" />,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-500/10",
      daysRemaining
    }
  } else {
    return {
      status: "Valid",
      variant: "success",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-500/10",
      daysRemaining
    }
  }
}

export function CertificateStatusBadge({ validTo }: { validTo: Date }) {
  const status = calculateCertificateStatus(validTo)
  
  return (
    <Badge
      variant={status.variant as "default" | "destructive" | "outline" | "secondary"}
      className={cn("px-2 py-1 flex items-center gap-1.5", status.color, status.bgColor)}
    >
      {status.icon}
      <span>
        {status.status} {status.daysRemaining > 0 ? `(${status.daysRemaining} days)` : ""}
      </span>
    </Badge>
  )
} 