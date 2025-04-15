import { ServiceIdsTable } from "@/src/components/ServiceIdsTable"
import { getServiceIds, getTeamById } from "@/src/app/actions"
import { Suspense } from "react"
import { ServiceIdTableSkeleton } from "@/src/components/ui/loading"
import { ServiceIdOnboardingModal } from "@/src/components/ServiceIdOnboardingModal"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

async function ServiceIdsContent({ teamId }: { teamId: string }) {
  if (!teamId) {
    redirect("/teams")
  }

  let serviceIds;
  let team;

  try {
    [serviceIds, team] = await Promise.all([
      getServiceIds(teamId),
      getTeamById(teamId)
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
    redirect("/teams");
  }

  if (!team) {
    notFound();
  }

  // Map application objects to their names
  const applicationNames = team?.applications?.map(app => app.name) || []

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service ID Management</h1>
        <ServiceIdOnboardingModal 
          teamId={teamId}
          teamApplications={applicationNames}
        />
      </div>
      <ServiceIdsTable 
        serviceIds={serviceIds}
        teamId={teamId}
        teamApplications={applicationNames}
      />
    </div>
  )
}

export default async function TeamServiceIds({
  params,
}: {
  params: { teamId: string }
}) {
  if (!params?.teamId) {
    redirect("/teams")
  }
  
  return (
    <Suspense fallback={<ServiceIdTableSkeleton />}>
      <ServiceIdsContent teamId={params.teamId} />
    </Suspense>
  )
}
