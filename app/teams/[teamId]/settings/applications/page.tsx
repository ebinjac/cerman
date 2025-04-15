import { getTeamById } from "@/src/app/actions"
import { redirect } from "next/navigation"
import { isValidUUID } from "@/src/lib/utils"
import { TeamSettingsNav } from "@/src/components/TeamSettingsNav"
import { ApplicationsForm } from "@/src/components/ApplicationsForm"

export default async function TeamApplicationsPage({
  params,
}: {
  params: { teamId: string }
}) {
  if (!params.teamId || !isValidUUID(params.teamId)) {
    redirect("/teams")
  }

  const team = await getTeamById(params.teamId)

  if (!team) {
    redirect("/teams")
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Applications</h1>
          <p className="text-muted-foreground">
            Manage your team's applications and their details
          </p>
        </div>
        <TeamSettingsNav teamId={params.teamId} />
        <div className="rounded-lg shadow p-6">
          <ApplicationsForm teamId={params.teamId} />
        </div>
      </div>
    </div>
  )
} 