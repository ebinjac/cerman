"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns, Team } from "./columns";
import { ViewTeamModal } from "./view-team-modal";
import { EditTeamModal } from "./edit-team-modal";
import { DeleteTeamModal } from "./delete-team-modal";

interface TeamsTableProps {
  data: Team[];
}

export function TeamsTable({ data }: TeamsTableProps) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  return (
    <>
      <DataTable
        columns={columns({
          onEdit: (team) => setEditingTeam(team),
          onDelete: (team) => setDeletingTeam(team),
          onView: (team) => setViewingTeam(team),
        })}
        data={data}
      />
      {viewingTeam && (
        <ViewTeamModal
          team={viewingTeam}
          open={!!viewingTeam}
          onOpenChange={() => setViewingTeam(null)}
        />
      )}
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          open={!!editingTeam}
          onOpenChange={() => setEditingTeam(null)}
          onSuccess={() => setEditingTeam(null)}
        />
      )}
      {deletingTeam && (
        <DeleteTeamModal
          team={deletingTeam}
          open={!!deletingTeam}
          onOpenChange={() => setDeletingTeam(null)}
          onSuccess={() => setDeletingTeam(null)}
        />
      )}
    </>
  );
} 