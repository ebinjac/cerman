import { CertificatesTable } from "@/src/components/CertificatesTable"
import { CertificateOnboardingModal } from "@/src/components/CertificateOnboardingModal"
import { getTeamCertificates, getTeamById } from "@/src/app/actions"
import { Suspense } from "react"
import { CertificateTableSkeleton } from "@/src/components/ui/loading"
import Link from "next/link"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Upload } from "lucide-react"

export const dynamic = 'force-dynamic'

async function CertificatesContent({ teamId }: { teamId: string }) {
  const certificates = await getTeamCertificates(teamId)
  const team = await getTeamById(teamId)

  if (!team) {
    notFound()
  }

  // Get application names from the team's applications
  const applications = team.applications?.map(app => app.name) || []

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            Manage and monitor your team's certificates
          </p>
        </div>
        <div className="flex gap-4">
          <Link href={`/teams/${teamId}/certificates/planning`}>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planning
            </Button>
          </Link>
          <Link href={`/teams/${teamId}/certificates/bulk-upload`}>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </Link>
          <Link href={`/teams/${teamId}/certificates/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Certificate
            </Button>
          </Link>
        </div>
      </div>

      <CertificatesTable 
        data={certificates} 
        teamId={teamId}
        teamApplications={applications}
      />
    </div>
  )
}

export default async function CertificatesPage({ params }: { params: { teamId: string } }) {
  return (
    <Suspense fallback={<CertificateTableSkeleton />}>
      <CertificatesContent teamId={params.teamId} />
    </Suspense>
  )
}