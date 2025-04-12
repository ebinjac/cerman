import { ServiceIdBulkUploadForm } from "@/src/components/ServiceIdBulkUploadForm"
import { getTeamById } from "@/src/app/actions"

export default async function ServiceIdBulkUploadPage({
  params,
}: {
  params: { teamId: string }
}) {
  const team = await getTeamById(params.teamId)

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Bulk Upload Service IDs</h1>
        <p className="text-muted-foreground">
          Upload multiple service IDs using a CSV file. Download the template below for the correct format.
        </p>
      </div>
      <ServiceIdBulkUploadForm 
        teamId={params.teamId}
        teamApplications={team?.applications || []}
      />
    </div>
  )
} 