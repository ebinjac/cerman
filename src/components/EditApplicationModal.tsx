"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { updateApplication } from "@/src/app/actions"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  carid: z.string().min(1, "CAR ID is required"),
  tla: z.string().min(1, "TLA is required"),
  tier: z.string().min(1, "Tier is required"),
  engineeringDirector: z.string().min(1, "Engineering Director is required"),
  engineeringVP: z.string().min(1, "Engineering VP is required"),
  productionDirector: z.string().min(1, "Production Director is required"),
  productionVP: z.string().min(1, "Production VP is required"),
  snowGroup: z.string().min(1, "Snow Group is required"),
  contactEmail: z.string().email("Invalid email address"),
  slack: z.string().min(1, "Slack channel is required"),
  confluence: z.string().min(1, "Confluence link is required"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean(),
  teamId: z.string().min(1, "Team ID is required"),
})

type FormValues = z.infer<typeof formSchema>

interface EditApplicationModalProps {
  application: FormValues & { id: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditApplicationModal({
  application,
  open,
  onOpenChange,
}: EditApplicationModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: application.name,
      carid: application.carid,
      tla: application.tla,
      tier: application.tier,
      engineeringDirector: application.engineeringDirector,
      engineeringVP: application.engineeringVP,
      productionDirector: application.productionDirector,
      productionVP: application.productionVP,
      snowGroup: application.snowGroup,
      contactEmail: application.contactEmail,
      slack: application.slack,
      confluence: application.confluence,
      description: application.description,
      isActive: application.isActive,
      teamId: application.teamId,
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await updateApplication(application.id, data)
      toast.success("Application updated successfully")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update application")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAR ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TLA</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engineeringDirector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineering Director</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engineeringVP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineering VP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionDirector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Director</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionVP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production VP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="snowGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snow Group</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Channel</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confluence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confluence Page</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 