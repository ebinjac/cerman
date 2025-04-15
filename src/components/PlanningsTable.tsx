"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ChevronDown, ChevronUp, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePlanning } from "@/src/app/actions"
import { EditPlanningModal } from "./EditPlanningModal"
import { toast } from "sonner"
import { CertificatePlanning } from "@/src/db/schema"

interface Certificate {
  id: string
  commonName: string
  serialNumber: string
  validTo: Date
  applicationId: string
}

interface Planning {
  planning: CertificatePlanning
  certificate: Certificate
}

interface PlanningsTableProps {
  teamId: string
  plannings: Planning[]
  onStatusChange?: (id: string, data: { status: string; updatedBy: string }) => Promise<void>
  onDelete: (planning: Planning) => Promise<void>
  onEdit?: () => Promise<void>
}

export function PlanningsTable({ teamId, plannings, onStatusChange, onDelete, onEdit }: PlanningsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
      case "cancelled":
      case "canceled":
        return "destructive"
      case "in_progress":
      case "in-progress":
        return "secondary"
      case "pending":
      case "planned":
      default:
        return "outline"
    }
  }

  const formatStatus = (status: string) => {
    return status.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleDelete = async (planning: Planning) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(planning.planning.id);
      if (onDelete) {
        await onDelete(planning);
      } else {
        await deletePlanning(planning.planning.id);
        toast.success("Planning deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete planning");
    } finally {
      setIsDeleting(null);
    }
  }

  const columns: ColumnDef<Planning>[] = [
    {
      id: "commonName",
      accessorFn: (row) => row.certificate.commonName,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Certificate
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      id: "serialNumber",
      accessorFn: (row) => row.certificate.serialNumber,
      header: "Serial Number",
    },
    {
      accessorKey: "planning.plannedDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Planned Date
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => format(new Date(row.original.planning.plannedDate), "PPP"),
    },
    {
      accessorKey: "planning.status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.planning.status
        return (
          <Badge variant={getStatusColor(status)}>
            {formatStatus(status)}
          </Badge>
        )
      },
    },
    {
      id: "assignedTo",
      accessorFn: (row) => row.planning.assignedTo,
      header: "Assigned To",
      cell: ({ row }) => row.original.planning.assignedTo || "-",
    },
    {
      id: "notes",
      accessorFn: (row) => row.planning.notes,
      header: "Notes",
      cell: ({ row }) => row.original.planning.notes || "-",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const planning = row.original.planning
        return (
          <div className="flex items-center gap-4">
            <EditPlanningModal 
              planning={{
                id: row.original.planning.id,
                plannedDate: new Date(row.original.planning.plannedDate),
                status: row.original.planning.status,
                notes: row.original.planning.notes || "",
                assignedTo: row.original.planning.assignedTo || ""
              }}
              onSuccess={onEdit}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isDeleting === planning.id}
                >
                  {isDeleting === planning.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the planning
                    for certificate {row.original.certificate.commonName}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.original)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable<Planning>({
    data: plannings,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true
  } as any)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter certificates..."
          value={(table.getColumn("commonName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("commonName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No plannings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 