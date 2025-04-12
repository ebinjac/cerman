import { ServiceIdsTable } from "@/src/components/ServiceIdsTable"

import { getServiceIds, getTeamById } from "@/src/app/actions"
import { Suspense } from "react"
import { ServiceIdTableSkeleton } from "@/src/components/ui/loading"
import { ServiceIdOnboardingModal } from "@/src/components/ServiceIdOnboardingModal"

async function ServiceIdsContent({ teamId }: { teamId: string }) {
  const [serviceIds, team] = await Promise.all([
    getServiceIds(teamId),
    getTeamById(teamId)
  ])

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service ID Management</h1>
        <ServiceIdOnboardingModal 
          teamId={teamId}
          teamApplications={team?.applications || []}
        />
      </div>
      <ServiceIdsTable 
        serviceIds={serviceIds}
        teamId={teamId}
        teamApplications={team?.applications || []}
      />
    </div>
  )
}

export default async function TeamServiceIds({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params;
  
  return (
    <Suspense fallback={<ServiceIdTableSkeleton />}>
      <ServiceIdsContent teamId={teamId} />
    </Suspense>
  )
}
