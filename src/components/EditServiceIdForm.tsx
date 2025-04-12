"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateServiceId } from "../app/actions"
import { toast } from "sonner"

const formSchema = z.object({
  svcid: z.string().min(1, "Service ID is required"),
  env: z.enum(["E1", "E2", "E3"], {
    required_error: "Environment is required",
  }),
  application: z.string().min(1, "Application is required"),
  expDate: z.date({
    required_error: "Expiry date is required",
  }),
  comment: z.string().optional(),
})

interface ServiceId {
  id: string
  svcid: string
  env: string
  application: string
  expDate: string
  comment: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface EditServiceIdFormProps {
  serviceId: ServiceId
  teamApplications: string[]
  onSuccess?: () => void
}

export function EditServiceIdForm({
  serviceId,
  teamApplications,
  onSuccess,
}: EditServiceIdFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      svcid: serviceId.svcid,
      env: serviceId.env as "E1" | "E2" | "E3",
      application: serviceId.application,
      expDate: new Date(serviceId.expDate),
      comment: serviceId.comment || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateServiceId(serviceId.id, {
        ...values,
        expDate: values.expDate.toISOString().split('T')[0],
      })
      toast.success("Service ID updated successfully")
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to update service ID")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="svcid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="env"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Environment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="E1">E1 (Development)</SelectItem>
                    <SelectItem value="E2">E2 (Staging)</SelectItem>
                    <SelectItem value="E3">E3 (Production)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="application"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teamApplications.map((app) => (
                      <SelectItem key={app} value={app}>
                        {app}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date("2100-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Service ID"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 