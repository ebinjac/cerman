import { getTeamById } from "@/src/app/actions";
import { redirect } from "next/navigation";
import { TeamSettingsForm } from "@/src/components/TeamSettingsForm";

export default async function TeamSettingsPage({
  params,
}: {
  params: { teamId: string };
}) {
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
        <div className=" rounded-lg shadow p-6">
          <TeamSettingsForm team={team} />
        </div>
      </div>
    </div>
  );
}
