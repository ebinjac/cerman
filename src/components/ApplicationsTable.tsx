"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { deleteApplication } from "@/src/app/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditApplicationModal } from "./EditApplicationModal"

interface Application {
  id: string
  name: string
  carid: string
  tla: string
  tier: string
  engineeringDirector: string
  engineeringVP: string
  productionDirector: string
  productionVP: string
  snowGroup: string
  contactEmail: string
  slack: string
  confluence: string
  description: string
  isActive: boolean
}

interface ApplicationsTableProps {
  applications: Application[]
  teamId: string
}

export function ApplicationsTable({ applications, teamId }: ApplicationsTableProps) {
  const router = useRouter()
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)

  const handleDelete = async (applicationId: string) => {
    setIsDeleting(true)
    try {
      await deleteApplication(teamId, applicationId)
      toast.success("Application deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete application")
    } finally {
      setIsDeleting(false)
      setApplicationToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>CAR ID</TableHead>
              <TableHead>TLA</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Engineering Director</TableHead>
              <TableHead>Production Director</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.name}</TableCell>
                <TableCell>{application.carid}</TableCell>
                <TableCell>{application.tla}</TableCell>
                <TableCell>{application.tier}</TableCell>
                <TableCell>{application.engineeringDirector}</TableCell>
                <TableCell>{application.productionDirector}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    application.isActive 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {application.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingApplication(application)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the application.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(application.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          teamId={teamId}
          open={!!editingApplication}
          onOpenChange={(open) => {
            if (!open) {
              setEditingApplication(null)
            }
          }}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </>
  )
} 