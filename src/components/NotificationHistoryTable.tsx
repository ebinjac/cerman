'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  FilterFns,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";

interface NotificationHistory {
  id: string;
  itemId: string;
  itemType: 'certificate' | 'serviceId';
  itemName: string;
  teamId: string;
  teamName: string;
  daysUntilExpiry: string;
  notificationType: string;
  recipients: string;
  sentAt: string;
  status: 'success' | 'failed';
  errorMessage: string | null;
  triggeredBy: 'system' | 'admin';
}

interface NotificationHistoryTableProps {
  data: NotificationHistory[];
}

export function NotificationHistoryTable({ data }: NotificationHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<NotificationHistory>[] = [
    {
      accessorKey: "itemName",
      header: "Item",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.itemName}</span>
          <span className="text-sm text-muted-foreground">ID: {row.original.itemId}</span>
        </div>
      ),
    },
    {
      accessorKey: "teamName",
      header: "Team",
    },
    {
      accessorKey: "itemType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.itemType === 'certificate' ? 'Certificate' : 'Service ID'}
        </Badge>
      ),
    },
    {
      accessorKey: "daysUntilExpiry",
      header: "Days Until Expiry",
      cell: ({ row }) => `${row.original.daysUntilExpiry} days`,
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }) => JSON.parse(row.original.recipients).join(', '),
    },
    {
      accessorKey: "sentAt",
      header: "Sent At",
      cell: ({ row }) => format(new Date(row.original.sentAt), 'PPpp'),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'success' ? 'default' : 'destructive'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "triggeredBy",
      header: "Triggered By",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.triggeredBy}
        </Badge>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    filterFns: {} as FilterFns,
  });

  return (
    <div className="space-y-4">
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
  );
} 