import { getDb } from "@/db/server";
import { teamsTable, certificatesTable, serviceIds } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamsTable } from "./teams-table";

export default async function AdminTeamsPage() {
  const db = await getDb();
  
  // Fetch teams with certificate and service ID counts
  const teams = await db
    .select({
      id: teamsTable.id,
      name: teamsTable.teamName,
      alert1: teamsTable.alert1,
      alert2: teamsTable.alert2,
      alert3: teamsTable.alert3,
      escalation: teamsTable.escalation,
      createdAt: teamsTable.createdAt,
      updatedAt: teamsTable.updatedAt,
      deletedAt: teamsTable.deletedAt,
      serviceIds: count(serviceIds.id).as('serviceIds'),
      certificates: count(certificatesTable.id).as('certificates'),
    })
    .from(teamsTable)
    .leftJoin(certificatesTable, eq(teamsTable.id, certificatesTable.teamId))
    .leftJoin(serviceIds, eq(teamsTable.id, serviceIds.renewingTeamId))
    .groupBy(teamsTable.id);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Teams Management</h1>
          <p className="text-muted-foreground">Manage and monitor all teams in the system</p>
        </div>
        <Link href="/admin/teams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Team
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{teams.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {teams.filter(team => !team.deletedAt).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Inactive Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {teams.filter(team => team.deletedAt).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <TeamsTable data={teams} />
    </div>
  );
} 