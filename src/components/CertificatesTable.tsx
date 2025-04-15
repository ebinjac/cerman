'use client'

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Certificate } from "@/db/schema"
import { Input } from "@/components/ui/input"
import { deleteCertificate } from "../app/actions";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  FilterFn
} from "@tanstack/react-table"
import { useState } from "react"
import { ArrowUpDown, ChevronUp, ChevronDown, Loader2, RotateCw, MoreVertical, Edit, Trash2, Download, Eye, CalendarPlus } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CertificateTableSkeleton } from "./ui/loading";
import Link from "next/link";
import { CertificateOnboardingModal } from "./CertificateOnboardingModal";
import { PlanningModal } from "./PlanningModal"

// Add these imports
import { Checkbox } from "@/components/ui/checkbox";
import { EditCertificateModal } from './EditCertificateModal'
import { ViewCertificateModal } from './ViewCertificateModal'


interface CertificatesTableProps {
  data: Certificate[];
  teamId: string;
  isLoading?: boolean;
  teamApplications: string[];
}

declare module '@tanstack/react-table' {
  interface FilterFns {
    expiryRange: FilterFn<Certificate>
    dayRange: FilterFn<Certificate>
  }
}

export function CertificatesTable({ data, teamId, isLoading, teamApplications }: CertificatesTableProps) {
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dayRangeFilter, setDayRangeFilter] = useState<string>('all')
  const [applicationFilter, setApplicationFilter] = useState<string>('all')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [planningCertificate, setPlanningCertificate] = useState<Certificate | null>(null);

  const handleDelete = async (certId: string) => {
    setIsDeleting(true);
    try {
      await deleteCertificate(certId);
      toast.success('Certificate deleted successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to delete certificate: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const selectedIds = Object.keys(rowSelection)
        .filter(id => rowSelection[id as keyof typeof rowSelection])
        .map(id => data[parseInt(id)].id);
      
      await Promise.all(selectedIds.map(id => deleteCertificate(id)));
      toast.success(`${selectedIds.length} certificates deleted successfully`);
      setRowSelection({});
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to delete certificates: ${error.message}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: ColumnDef<Certificate, any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // In the columns definition:
    {
      accessorKey: "commonName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="sticky left-0 bg-background z-10"
        >
          Common Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="sticky left-0 bg-background z-10">
          {row.original.commonName}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
      enableSorting: false,
    },
    {
      accessorKey: "applicationId",
      header: "Application",
      cell: ({ row }) => row.original.applicationId || '-',
      enableSorting: true,
      filterFn: (row: { original: Certificate }, columnId: string, filterValue: string) => {
        if (filterValue === 'all') return true
        return row.original.applicationId === filterValue
      },
    },
    {
      id: "status",
      header: "Status",
      filterFn: 'expiryRange',
      cell: ({ row }) => {
        const validTo = row.original.validTo
        const today = new Date()
        const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysRemaining < 0) return <Badge variant="destructive">Expired</Badge>
        if (daysRemaining <= 90) return <Badge variant="secondary">Expiring Soon</Badge>
        return <Badge variant="outline">Valid</Badge>
      },
    },
    {
      id: "daysTillExpiry",
      header: "Days Till Expiry",
      filterFn: 'dayRange',
      cell: ({ row }) => {
        const validTo = row.original.validTo
        const today = new Date()
        const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysRemaining > 0 ? `${daysRemaining} days` : "Expired"
      },
    },
    {
      accessorKey: "validFrom",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valid From
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => format(row.original.validFrom, "MMM dd, yyyy"),
      sortingFn: 'datetime'
    },
    {
      accessorKey: "validTo",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valid To
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => format(row.original.validTo, "MMM dd, yyyy"),
      sortingFn: 'datetime'
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const certificate = row.original;
        
        const handleRefresh = async () => {
          if (!certificate.isAmexCert) {
            toast.error('Refresh is only available for AMEX certificates');
            return;
          }

          setIsRefreshing(true);
          try {
            const response = await fetch(
              `/api/teams/${teamId}/certificates/${certificate.id}/refresh`,
              { method: 'POST' }
            );
            
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Refresh failed');
            }

            const data = await response.json();
            router.refresh();
            toast.success('Certificate refreshed successfully');
          } catch (error: any) {
            toast.error(error.message);
          } finally {
            setIsRefreshing(false);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewingCertificate(certificate)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingCertificate(certificate)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPlanningCertificate(certificate)}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Plan
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleRefresh} 
                disabled={isRefreshing || !certificate.isAmexCert}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="mr-2 h-4 w-4" />
                )}
                Refresh
                {!certificate.isAmexCert && (
                  <span className="ml-2 text-xs text-muted-foreground">(AMEX only)</span>
                )}
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-600 hover:!text-red-700"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the certificate.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(certificate.id)}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
      rowSelection, // Add this
    },
    onRowSelectionChange: setRowSelection, // Add this
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      expiryRange: (row: { original: Certificate }, columnId: string, filterValue: string) => {
        const validTo = row.original.validTo
        const today = new Date()
        const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        switch(filterValue) {
          case 'expired': return daysRemaining < 0
          case 'expiring-soon': return daysRemaining > 0 && daysRemaining <= 90
          case 'active': return daysRemaining > 90
          default: return true
        }
      },
      dayRange: (row: { original: Certificate }, columnId: string, filterValue: string) => {
        const validTo = row.original.validTo
        const today = new Date()
        const daysRemaining = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (filterValue === 'all') return true
        const range = parseInt(filterValue)
        return daysRemaining > 0 && daysRemaining <= range
      }
    }
  } as any)

  const handleExport = () => {
    const csvContent = [
      // CSV headers with all certificate fields
      'Common Name,Serial Number,Status,Days Till Expiry,Valid From,Valid To,' +
      'Environment,Application ID,Server Name,Keystore Path,URI,Comment,' +
      'Certificate Identifier,Certificate Purpose,Certificate Status,Is AMEX Cert,' +
      'Created By,Hosting Team Name,Request Channel Name,TA Client Name',
      
      // CSV data rows
      ...table.getFilteredRowModel().rows.map(row => {
        const cert = row.original as Certificate
        const validFrom = format(cert.validFrom, 'MMM dd, yyyy')
        const validTo = format(cert.validTo, 'MMM dd, yyyy')
        const daysRemaining = Math.ceil((cert.validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        return [
          `"${cert.commonName}"`,
          `"${cert.serialNumber}"`,
          `"${daysRemaining < 0 ? 'Expired' : daysRemaining <= 90 ? 'Expiring Soon' : 'Valid'}"`,
          `"${daysRemaining > 0 ? daysRemaining : 'Expired'}"`,
          `"${validFrom}"`,
          `"${validTo}"`,
          `"${cert.environment || ''}"`,
          `"${cert.applicationId || ''}"`,
          `"${cert.serverName || ''}"`,
          `"${cert.keystorePath || ''}"`,
          `"${cert.uri || ''}"`,
          `"${cert.comment || ''}"`,
          `"${cert.certificateIdentifier || ''}"`,
          `"${cert.certificatePurpose || ''}"`,
          `"${cert.certificateStatus || ''}"`,
          `"${cert.isAmexCert ? 'Yes' : 'No'}"`,
          `"${cert.createdBy || ''}"`,
          `"${cert.hostingTeamName || ''}"`,
          `"${cert.requestChannelName || ''}"`,
          `"${cert.taClientName || ''}"`
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `certificates-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearFilters = () => {
    setGlobalFilter('')
    setStatusFilter('all')
    setDayRangeFilter('all')
    setApplicationFilter('all')
    table.resetColumnFilters()
  }

  if (isLoading) {
    return <CertificateTableSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search certificates..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <CertificateOnboardingModal
            teamId={teamId}
            teamApplications={teamApplications}
          />
          <div className="flex items-center gap-2">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value)
                table.getColumn('status')?.setFilterValue(value)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={dayRangeFilter}
              onValueChange={(value) => {
                setDayRangeFilter(value)
                table.getColumn('daysTillExpiry')?.setFilterValue(value)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Expires Within" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={applicationFilter}
              onValueChange={(value) => {
                setApplicationFilter(value)
                table.getColumn('applicationId')?.setFilterValue(value)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {Array.from(new Set(data.map(cert => cert.applicationId).filter(Boolean))).map(appId => (
                  <SelectItem key={appId} value={appId}>
                    {appId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!globalFilter && statusFilter === 'all' && dayRangeFilter === 'all'}
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={data.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead 
                    key={header.id}
                    className={`${header.column.id === 'commonName' ? 'sticky left-0 bg-background z-20' : ''} ${header.column.id === 'actions' ? 'sticky right-0 bg-background z-20' : ''}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell 
                      key={cell.id}
                      className={`${cell.column.id === 'commonName' ? 'sticky left-0 bg-background z-10' : ''} ${cell.column.id === 'actions' ? 'sticky right-0 bg-background z-10' : ''}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No certificates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              setPagination(prev => ({
                ...prev,
                pageSize: Number(value),
                pageIndex: 0
              }))
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        {Object.keys(rowSelection).length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the selected certificates. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleBulkDelete}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {editingCertificate && (
        <EditCertificateModal
          certificate={editingCertificate}
          teamId={teamId}
          teamApplications={Array.from(new Set(data.map(c => c.applicationId).filter(Boolean)))}
          open={!!editingCertificate}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCertificate(null);
            }
          }}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
      {viewingCertificate && (
        <ViewCertificateModal
          certificate={viewingCertificate}
          open={!!viewingCertificate}
          onOpenChange={(open) => {
            if (!open) {
              setViewingCertificate(null);
            }
          }}
        />
      )}
      <PlanningModal
        open={!!planningCertificate}
        onOpenChange={(open) => !open && setPlanningCertificate(null)}
        certificateId={planningCertificate?.id || ""}
        teamId={teamId}
        onSuccess={() => {
          setPlanningCertificate(null)
        }}
      />
    </div>
  )

}
