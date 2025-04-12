import { CertificateBulkUpload } from "@/src/components/CertificateBulkUpload"
import { getTeamById } from "@/src/app/actions"
import { Suspense } from "react"
import { CertificateTableSkeleton } from "@/src/components/ui/loading"

export default async function BulkUploadPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  const team = await getTeamById(teamId)

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Certificate Upload</h1>
      </div>
      <Suspense fallback={<CertificateTableSkeleton />}>
        <CertificateBulkUpload 
          teamId={teamId}
          teamApplications={team?.applications || []}
        />
      </Suspense>
    </div>
  )
}