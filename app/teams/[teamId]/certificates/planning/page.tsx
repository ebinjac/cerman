"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { format, isFuture, isPast, compareAsc } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { getTeamPlannings, updatePlanning, deletePlanning } from "@/src/app/actions"
import type { CertificatePlanning } from "@/src/db/schema"
import { PlanningsTable } from "@/src/components/PlanningsTable"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Certificate {
  id: string
  commonName: string
  serialNumber: string
  validTo: Date
  applicationId: string
}

interface Planning {
  planning: CertificatePlanning
  certificate: Certificate
}

interface PageProps {
  params: Promise<{
    teamId: string
  }>
}

export default function CertificatePlanningPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [plannings, setPlannings] = useState<Planning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const router = useRouter()

  const fetchPlannings = async () => {
    try {
      const data = await getTeamPlannings(resolvedParams.teamId)
      setPlannings(data)
    } catch (error) {
      toast.error("Failed to load plannings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlannings()
  }, [resolvedParams.teamId])

  const planningsByDate = plannings.reduce((acc, planning) => {
    const date = format(new Date(planning.planning.plannedDate), "yyyy-MM-dd")
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(planning)
    return acc
  }, {} as Record<string, Planning[]>)

  // Sort upcoming plannings by date
  const upcomingPlannings = plannings
    .filter(planning => isFuture(new Date(planning.planning.plannedDate)))
    .sort((a, b) => compareAsc(
      new Date(a.planning.plannedDate),
      new Date(b.planning.plannedDate)
    ))

  const handleStatusChange = async (id: string, data: { status: string; updatedBy: string }) => {
    try {
      await updatePlanning(id, data)
      await fetchPlannings()
      toast.success("Planning status updated successfully")
    } catch (error) {
      toast.error("Failed to update planning status")
      throw error
    }
  }

  const handleDelete = async (planning: Planning) => {
    try {
      await deletePlanning(planning.planning.id);
      setPlannings(prev => prev.filter(p => p.planning.id !== planning.planning.id));
      toast.success("Planning deleted successfully");
    } catch (error) {
      toast.error("Failed to delete planning");
      router.refresh();
    }
  };

  const handleEdit = async () => {
    await fetchPlannings()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificate Planning</h1>
          <p className="text-muted-foreground">
            Plan and track certificate renewals for your team
          </p>
        </div>
        <Button onClick={() => router.push(`/teams/${resolvedParams.teamId}/certificates/planning/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Planning
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar and Selected Date View */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Select a date to view plannings</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Date</CardTitle>
              <CardDescription>
                Certificate renewals planned for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "today"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : selectedDate && planningsByDate[format(selectedDate, "yyyy-MM-dd")] ? (
                <div className="space-y-4">
                  {planningsByDate[format(selectedDate, "yyyy-MM-dd")].map((planning) => (
                    <div
                      key={planning.planning.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{planning.certificate.commonName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {planning.certificate.applicationId}
                        </p>
                        <Badge
                          variant={
                            planning.planning.status === "completed"
                              ? "default"
                              : planning.planning.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {planning.planning.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          router.push(
                            `/teams/${resolvedParams.teamId}/certificates/planning/${planning.planning.id}`
                          )
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No plannings scheduled for this date
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Plannings Table View */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>All Plannings</CardTitle>
              <CardDescription>View and manage all certificate renewal plannings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-4 animate-spin" />
                </div>
              ) : plannings.length > 0 ? (
                <PlanningsTable 
                  teamId={resolvedParams.teamId}
                  plannings={plannings}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  No plannings found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 