import { CertificatesTable } from "@/src/components/CertificatesTable"
import { CertificateOnboardingModal } from "@/src/components/CertificateOnboardingModal"
import { getTeamCertificates, getTeamById } from "@/src/app/actions"
import { Suspense } from "react"
import { CertificateTableSkeleton } from "@/src/components/ui/loading"
import Link from "next/link"

async function CertificatesContent({ teamId }: { teamId: string }) {
  const [certificates, team] = await Promise.all([
    getTeamCertificates(teamId),
    getTeamById(teamId)
  ])

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Certificate Management</h1>
        <div className="flex gap-4">
          <CertificateOnboardingModal 
            teamId={teamId}
            teamApplications={team?.applications || []}
          />
          <Link
            href={`/teams/${teamId}/certificates/bulk-upload`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Bulk Upload
          </Link>
        </div>
      </div>
      <CertificatesTable 
        data={certificates}
        teamId={teamId}
      />
    </div>
  )
}

export default async function TeamCertificates({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params;
  
  return (
    <Suspense fallback={<CertificateTableSkeleton />}>
      <CertificatesContent teamId={teamId} />
    </Suspense>
  )
}