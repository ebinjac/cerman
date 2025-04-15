"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Application } from "@/db/types"

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  carid: z.string().min(1, "CAR ID is required"),
  tla: z.string().min(1, "TLA is required"),
  tier: z.string().min(1, "Tier is required"),
  engineeringDirector: z.string().min(1, "Engineering Director is required"),
  engineeringVP: z.string().min(1, "Engineering VP is required"),
  productionDirector: z.string().min(1, "Production Director is required"),
  productionVP: z.string().min(1, "Production VP is required"),
  snowGroup: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  slack: z.string().optional(),
  confluence: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  teamId: string
  application?: Application
  onSuccess?: () => void
}

export function ApplicationForm({
  teamId,
  application,
  onSuccess,
}: ApplicationFormProps) {
  const router = useRouter()
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: application?.name || "",
      carid: application?.carid || "",
      tla: application?.tla || "",
      tier: application?.tier || "",
      engineeringDirector: application?.engineeringDirector || "",
      engineeringVP: application?.engineeringVP || "",
      productionDirector: application?.productionDirector || "",
      productionVP: application?.productionVP || "",
      snowGroup: application?.snowGroup || "",
      contactEmail: application?.contactEmail || "",
      slack: application?.slack || "",
      confluence: application?.confluence || "",
      description: application?.description || "",
      isActive: application?.isActive ?? true,
    },
  })

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      const url = application
        ? `/api/teams/${teamId}/applications/${application.id}`
        : `/api/teams/${teamId}/applications`
      const method = application ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save application")
      }

      toast.success(
        application
          ? "Application updated successfully"
          : "Application created successfully"
      )
      router.refresh()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to save application")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Application name" {...field} />
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
                  <Input placeholder="CAR ID" {...field} />
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
                  <Input placeholder="TLA" {...field} />
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
                  <Input placeholder="Tier" {...field} />
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
                  <Input placeholder="Engineering Director" {...field} />
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
                  <Input placeholder="Engineering VP" {...field} />
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
                  <Input placeholder="Production Director" {...field} />
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
                  <Input placeholder="Production VP" {...field} />
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
                <FormLabel>SNOW Group</FormLabel>
                <FormControl>
                  <Input placeholder="SNOW Group" {...field} />
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
                  <Input type="email" placeholder="Contact Email" {...field} />
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
                <FormLabel>Slack</FormLabel>
                <FormControl>
                  <Input placeholder="Slack channel" {...field} />
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
                <FormLabel>Confluence</FormLabel>
                <FormControl>
                  <Input placeholder="Confluence page" {...field} />
                </FormControl>
                <FormMessage />
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
                <Textarea
                  placeholder="Application description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {application ? "Update Application" : "Create Application"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 