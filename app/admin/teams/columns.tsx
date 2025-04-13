"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export interface Team {
  id: string;
  name: string;
  alert1: string | null;
  alert2: string | null;
  alert3: string | null;
  escalation: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  serviceIds: number;
  certificates: number;
}

interface ColumnsProps {
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onView: (team: Team) => void;
}

export function columns({ onEdit, onDelete, onView }: ColumnsProps): ColumnDef<Team>[] {
  return [
    {
      accessorKey: "name",
      header: "Team Name",
    },
    {
      accessorKey: "serviceIds",
      header: "Service IDs",
    },
    {
      accessorKey: "certificates",
      header: "Certificates",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const team = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(team)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(team)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(team)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
} 