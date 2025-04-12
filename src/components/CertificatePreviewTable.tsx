'use client'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { sortingFns } from '@tanstack/react-table'

interface CertificatePreviewProps {
  data: any[]
  validationErrors: {[key: string]: string}[]
  teamApplications: string[]
}

export function CertificatePreviewTable({ 
  data, 
  validationErrors,
  teamApplications
}: CertificatePreviewProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'isAmexCert',
      header: 'AMEX Cert',
      cell: ({ row }) => row.original.isAmexCert === 'true' ? 'Yes' : 'No'
    },
    {
      accessorKey: 'commonName',
      header: 'Common Name',
    },
    {
      accessorKey: 'serialNumber',
      header: 'Serial Number',
    },
    {
      accessorKey: 'applicationId',
      header: 'Application',
      cell: ({ row }) => (
        <span className={teamApplications.includes(row.original.applicationId) ? '' : 'text-destructive'}>
          {row.original.applicationId}
        </span>
      )
    },
    // Add other columns as needed
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const hasError = validationErrors[row.index] !== undefined
        return (
          <span className={hasError ? 'text-destructive' : 'text-success'}>
            {hasError ? 'Invalid' : 'Valid'}
          </span>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      expiryRange: () => true,
      dayRange: () => true
    }, // Add empty filterFns object
    sortingFns: {}, // Add empty sortingFns object
  })

  // Sort records with errors first
  const sortedData = [...data].sort((a, b) => {
    const aHasError = validationErrors[data.indexOf(a)] !== undefined
    const bHasError = validationErrors[data.indexOf(b)] !== undefined
    return aHasError === bHasError ? 0 : aHasError ? -1 : 1
  })

  return (
    <div className="space-y-4">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Validation Errors Found</AlertTitle>
          <AlertDescription>
            {validationErrors.length} records have validation issues. Please fix them before uploading.
          </AlertDescription>
        </Alert>
      )}

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
              table.getRowModel().rows.map((row) => {
                const hasError = validationErrors[row.index] !== undefined
                return (
                  <TableRow
                    key={row.id}
                    data-state={hasError && "error"}
                    className={hasError ? 'bg-destructive/10' : ''}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
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