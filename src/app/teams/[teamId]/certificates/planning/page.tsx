import { db } from "@/db"
import { certificatePlannings, certificates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { PlanningsTable } from "@/components/PlanningsTable"
import { updatePlanning } from "@/app/actions"

interface PlanningPageProps {
  params: {
    teamId: string
  }
}

export default async function PlanningPage({ params }: PlanningPageProps) {
  const plannings = await db.query.certificatePlannings.findMany({
    where: eq(certificatePlannings.teamId, params.teamId),
    with: {
      certificate: true,
    },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Certificate Planning</h1>
      <PlanningsTable plannings={plannings} onStatusChange={updatePlanning} />
    </div>
  )
} 