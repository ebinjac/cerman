import { getDb } from "@/db/server";
import { eq } from 'drizzle-orm';
import { teamsTable } from "@/db/schema";
import { TeamSelector } from "@/src/components/TeamSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getSession } from "@/lib/session";
import { db } from "@/src/db/client";
import { headers } from 'next/headers';



export default async function TeamsPage({
  params,
}: {
  params: Promise<{ teamid: string }>
}) {

  const headersList = headers();
  const cookie = (await headersList).get('cookie') || '';

  const session = await getSession(cookie);
  const team = await db.select()
    .from(teamsTable)
    .where(eq(teamsTable.id, (await params).teamid))
    .execute().then((res) => res[0]);

  if (!team) return <div>Team not found</div>;

  let teams = [];
  let error = null;

  try {
    const db = await getDb();
    teams = await db.select({
      id: teamsTable.id,
      name: teamsTable.teamName,
    }).from(teamsTable);
  } catch (err) {
    console.error("Failed to fetch teams:", err);
    error = "Failed to load teams. Please try again later.";
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              Select a team to view and manage its details
            </p>
          </div>
          <TeamSelector teams={teams} />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Available Teams</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-muted-foreground">No teams available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <Card key={team.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{team.name}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 