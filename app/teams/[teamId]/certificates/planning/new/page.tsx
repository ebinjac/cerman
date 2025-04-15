"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getCertificateById } from "@/src/app/actions"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  plannedDate: z.date({
    required_error: "Please select a date for the renewal",
  }),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], {
    required_error: "Please select a status",
  }),
  notes: z.string().optional(),
  assignedTo: z.string().min(1, "Please enter an assignee"),
})

export default function NewPlanningPage({
  params,
}: {
  params: { teamId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const certificateId = searchParams.get("certificateId")
  const [certificate, setCertificate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      notes: "",
      assignedTo: "",
    },
  })

  useEffect(() => {
    async function loadCertificate() {
      if (!certificateId) {
        toast.error("No certificate selected")
        router.push(`/teams/${params.teamId}/certificates`)
        return
      }

      try {
        const cert = await getCertificateById(certificateId)
        setCertificate(cert)
      } catch (error) {
        toast.error("Failed to load certificate details")
        router.push(`/teams/${params.teamId}/certificates`)
      } finally {
        setIsLoading(false)
      }
    }

    loadCertificate()
  }, [certificateId, params.teamId, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: Implement the server action to create planning
      // await createPlanning({
      //   teamId: params.teamId,
      //   certificateId: certificateId!,
      //   ...values,
      // })

      toast.success("Planning created successfully")
      router.push(`/teams/${params.teamId}/certificates/planning`)
    } catch (error) {
      toast.error("Failed to create planning")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Plan Certificate Renewal</h1>
          <p className="text-muted-foreground">
            Schedule a renewal for your certificate
          </p>
        </div>

        {certificate && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
                <CardDescription>Review the certificate information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Common Name:</span>{" "}
                  {certificate.commonName}
                </div>
                <div>
                  <span className="font-medium">Serial Number:</span>{" "}
                  {certificate.serialNumber}
                </div>
                <div>
                  <span className="font-medium">Valid Until:</span>{" "}
                  {format(new Date(certificate.validTo), "PPP")}
                </div>
                <div>
                  <span className="font-medium">Application:</span>{" "}
                  {certificate.applicationId}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planning Details</CardTitle>
                <CardDescription>Enter the renewal planning details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="plannedDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Planned Date</FormLabel>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="rounded-md border"
                            disabled={(date) => date < new Date()}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter assignee's email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add any notes about the renewal"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Planning</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 