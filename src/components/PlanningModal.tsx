import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPlanning } from "@/src/app/actions"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

interface PlanningModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificateId: string
  teamId: string
  onSuccess?: () => void
}

export function PlanningModal({
  open,
  onOpenChange,
  certificateId,
  teamId,
  onSuccess
}: PlanningModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [status, setStatus] = useState<string>("pending")
  const [notes, setNotes] = useState<string>("")
  const [assignedTo, setAssignedTo] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast.error("Please select a planned date")
      return
    }

    setIsSubmitting(true)
    try {
      await createPlanning({
        teamId,
        certificateId,
        plannedDate: date,
        status,
        notes,
        assignedTo
      })
      toast.success("Planning created successfully")
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create planning")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Planning</DialogTitle>
          <DialogDescription>
            Schedule a certificate renewal planning
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Planned Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="assignedTo" className="text-sm font-medium">
                Assigned To
              </label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter assignee name"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this planning"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Planning"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 