"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Download, X, Upload } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { deleteServiceId } from "../app/actions"
import { toast } from "sonner"
import { ViewServiceIdModal } from "./ViewServiceIdModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { EditServiceIdModal } from "./EditServiceIdModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface ServiceIdsTableProps {
  serviceIds: ServiceId[]
  teamId: string
  teamApplications: string[]
}

export function ServiceIdsTable({ serviceIds, teamId, teamApplications }: ServiceIdsTableProps) {
  const router = useRouter()
  const [viewingServiceId, setViewingServiceId] = useState<ServiceId | null>(null)
  const [expiryFilter, setExpiryFilter] = useState<string>("all")
  const [applicationFilter, setApplicationFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteServiceId(id)
      toast.success("Service ID deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete service ID")
    } finally {
      setServiceIdToDelete(null)
    }
  }

  const getStatus = (expDate: string) => {
    const today = new Date()
    const expiryDate = new Date(expDate)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: "Expired", variant: "destructive" as const }
    if (daysUntilExpiry <= 30) return { status: "Expiring Soon", variant: "secondary" as const }
    return { status: "Valid", variant: "default" as const }
  }

  const filteredServiceIds = serviceIds.filter((serviceId) => {
    const { status } = getStatus(serviceId.expDate)
    const matchesExpiryFilter =
      expiryFilter === "all" ||
      (expiryFilter === "expired" && status === "Expired") ||
      (expiryFilter === "30" && status === "Expiring Soon") ||
      (expiryFilter === "60" && getStatus(serviceId.expDate).status === "Valid" && new Date(serviceId.expDate).getTime() - new Date().getTime() <= 60 * 24 * 60 * 60 * 1000) ||
      (expiryFilter === "90" && getStatus(serviceId.expDate).status === "Valid" && new Date(serviceId.expDate).getTime() - new Date().getTime() <= 90 * 24 * 60 * 60 * 1000)

    const matchesApplicationFilter =
      applicationFilter === "all" || serviceId.application === applicationFilter

    const matchesSearchQuery =
      searchQuery === "" ||
      serviceId.svcid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceId.application.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesExpiryFilter && matchesApplicationFilter && matchesSearchQuery
  })

  const uniqueApplications = Array.from(new Set(serviceIds.map((id) => id.application)))

  const handleClearFilters = () => {
    setExpiryFilter("all")
    setApplicationFilter("all")
    setSearchQuery("")
  }

  const handleExportToCSV = () => {
    const headers = ["Service ID", "Environment", "Application", "Expiry Date", "Status", "Comment"]
    const csvContent = [
      headers.join(","),
      ...filteredServiceIds.map((serviceId) => {
        const { status } = getStatus(serviceId.expDate)
        return [
          serviceId.svcid,
          serviceId.env,
          serviceId.application,
          format(new Date(serviceId.expDate), "yyyy-MM-dd"),
          status,
          serviceId.comment || ""
        ].join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `service-ids-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const hasActiveFilters = expiryFilter !== "all" || applicationFilter !== "all" || searchQuery !== ""

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-4">
            <Input
              placeholder="Search by Service ID or Application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Link href={`/teams/${teamId}/service-ids/bulk-upload`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service IDs</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="30">Expiring in 30 days</SelectItem>
                <SelectItem value="60">Expiring in 60 days</SelectItem>
                <SelectItem value="90">Expiring in 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={applicationFilter} onValueChange={setApplicationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {uniqueApplications.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleExportToCSV}
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServiceIds.map((serviceId) => {
                const { status, variant } = getStatus(serviceId.expDate)
                return (
                  <TableRow key={serviceId.id}>
                    <TableCell className="font-medium">{serviceId.svcid}</TableCell>
                    <TableCell>{serviceId.env}</TableCell>
                    <TableCell>{serviceId.application}</TableCell>
                    <TableCell>{format(new Date(serviceId.expDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={variant}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setViewingServiceId(serviceId)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <EditServiceIdModal
                              serviceId={serviceId}
                              teamApplications={teamApplications}
                              onSuccess={() => router.refresh()}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setServiceIdToDelete(serviceId.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {viewingServiceId && (
        <ViewServiceIdModal
          serviceId={viewingServiceId}
          open={!!viewingServiceId}
          onOpenChange={() => setViewingServiceId(null)}
        />
      )}

      {serviceIdToDelete && (
        <AlertDialog open={!!serviceIdToDelete} onOpenChange={() => setServiceIdToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Service ID</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this service ID? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDelete(serviceIdToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
} 