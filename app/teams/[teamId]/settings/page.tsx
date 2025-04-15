import { getTeamById } from "@/src/app/actions";
import { redirect } from "next/navigation";
import { TeamSettingsForm } from "@/src/components/TeamSettingsForm";
import { isValidUUID } from "@/src/lib/utils";
import { ApplicationsTable } from "@/src/components/ApplicationsTable";
import { TeamSettingsNav } from "@/src/components/TeamSettingsNav";

export default async function TeamSettingsPage({
  params,
  searchParams,
}: {
  params: { teamId: string };
  searchParams: { tab?: string };
}) {
  // Check if teamId is valid UUID
  if (!params.teamId || !isValidUUID(params.teamId)) {
    redirect("/teams");
  }

  const team = await getTeamById(params.teamId);

  if (!team) {
    redirect("/teams");
  }

  const tab = searchParams.tab || "general";

  return (
    <div className="space-y-0">
      <div className="border-b bg-background">
        <div className="container mx-auto px-8">
          <div className="flex flex-col space-y-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
            <p className="text-muted-foreground">
              Manage your team's contact information and group details
            </p>
          </div>
          <TeamSettingsNav teamId={params.teamId} activeTab={tab} />
        </div>
      </div>

      <div className="container mx-auto px-8 py-6">
        {tab === "general" && (
          <div className="rounded-lg border">
            <div className="p-6">
              <TeamSettingsForm team={team} />
            </div>
          </div>
        )}
        
        {tab === "applications" && (
          <div className="rounded-lg border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Applications</h2>
                <a 
                  href={`/teams/${team.id}/applications/new`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Add Application
                </a>
              </div>
              <ApplicationsTable applications={team.applications || []} teamId={team.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
