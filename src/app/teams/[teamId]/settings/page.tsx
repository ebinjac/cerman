import { getTeamById } from "@/src/app/actions";
import { redirect } from "next/navigation";
import { TeamSettingsForm } from "@/src/components/TeamSettingsForm";
import { isValidUUID } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function TeamSettingsPage({
  params,
}: {
  params: { teamId: string };
}) {
  // Check if teamId is valid UUID
  if (!params.teamId || !isValidUUID(params.teamId)) {
    redirect("/teams");
  }

  const team = await getTeamById(params.teamId);

  if (!team) {
    redirect("/teams");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">
            Manage your team's contact information and group details
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="rounded-lg shadow p-6">
              <TeamSettingsForm team={team} />
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Applications</h2>
                <Link href={`/teams/${team.id}/applications/new`}>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Add Application
                  </button>
                </Link>
              </div>
              {/* Applications list will be added here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 