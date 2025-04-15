import { getTeamById } from "@/src/app/actions";
import { redirect } from "next/navigation";
import { isValidUUID } from "@/src/lib/utils";
import { ApplicationsForm } from "@/src/components/ApplicationsForm";

export default async function NewApplicationPage({
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
          <h1 className="text-3xl font-bold">Add New Application</h1>
          <p className="text-muted-foreground">
            Create a new application for your team
          </p>
        </div>

        <div className="rounded-lg shadow p-6">
          <ApplicationsForm teamId={team.id} />
        </div>
      </div>
    </div>
  );
} 