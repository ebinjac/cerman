"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createApplication } from "@/src/app/actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  carid: z.string().min(1, "CAR ID is required"),
  tla: z.string().min(1, "TLA is required"),
  tier: z.string().min(1, "Tier is required"),
  engineeringDirector: z.string().min(1, "Engineering Director is required"),
  engineeringVP: z.string().min(1, "Engineering VP is required"),
  productionDirector: z.string().min(1, "Production Director is required"),
  productionVP: z.string().min(1, "Production VP is required"),
  snowGroup: z.string().min(1, "SNOW Group is required"),
  contactEmail: z.string().email("Invalid email address"),
  slack: z.string().min(1, "Slack channel is required"),
  confluence: z.string().min(1, "Confluence page is required"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().default(true),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationsFormProps {
  teamId: string
}

export function ApplicationsForm({ teamId }: ApplicationsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showFullForm, setShowFullForm] = useState(false)
  const [carId, setCarId] = useState("")

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      carid: "",
      tla: "",
      tier: "",
      engineeringDirector: "",
      engineeringVP: "",
      productionDirector: "",
      productionVP: "",
      snowGroup: "",
      contactEmail: "",
      slack: "",
      confluence: "",
      description: "",
      isActive: true,
    },
  })

  const handleSearch = async () => {
    if (!carId) {
      toast.error("Please enter a CAR ID")
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to fetch application details
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data based on CAR ID
      const mockData = {
        name: `Application ${carId}`,
        tla: carId.slice(0, 3).toUpperCase(),
        tier: "Tier 1",
        engineeringDirector: "John Doe",
        engineeringVP: "Jane Smith",
        productionDirector: "Mike Johnson",
        productionVP: "Sarah Williams",
        snowGroup: "SNOW-123",
        contactEmail: "contact@example.com",
        slack: `#${carId}-channel`,
        confluence: `https://confluence.example.com/${carId}`,
        description: `This is a description for application ${carId}`,
      }

      // Update form with mock data
      form.setValue("carid", carId)
      form.setValue("name", mockData.name)
      form.setValue("tla", mockData.tla)
      form.setValue("tier", mockData.tier)
      form.setValue("engineeringDirector", mockData.engineeringDirector)
      form.setValue("engineeringVP", mockData.engineeringVP)
      form.setValue("productionDirector", mockData.productionDirector)
      form.setValue("productionVP", mockData.productionVP)
      form.setValue("snowGroup", mockData.snowGroup)
      form.setValue("contactEmail", mockData.contactEmail)
      form.setValue("slack", mockData.slack)
      form.setValue("confluence", mockData.confluence)
      form.setValue("description", mockData.description)

      setShowFullForm(true)
      toast.success("Application details found")
    } catch (error) {
      toast.error("Failed to fetch application details")
    } finally {
      setIsLoading(false)
    }
  }

  function onSubmit(values: ApplicationFormValues) {
    try {
      createApplication({
        ...values,
        teamId,
        metadata: {},
      })

      toast.success("Application created successfully")
      form.reset()
      setShowFullForm(false)
      setCarId("")
      router.refresh()
    } catch (error) {
      toast.error("Failed to create application")
    }
  }

  if (!showFullForm) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Enter CAR ID"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="carid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAR ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Application name" />
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
                  <Input {...field} placeholder="Three-letter acronym" />
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
                  <Input {...field} placeholder="Tier level" />
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
                  <Input {...field} placeholder="Engineering director name" />
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
                  <Input {...field} placeholder="Engineering VP name" />
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
                  <Input {...field} placeholder="Production director name" />
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
                  <Input {...field} placeholder="Production VP name" />
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
                  <Input {...field} placeholder="SNOW group name" />
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
                  <Input {...field} placeholder="Contact email address" />
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
                  <Input {...field} placeholder="Slack channel name" />
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
                  <Input {...field} placeholder="Confluence page URL" />
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
                <Textarea {...field} placeholder="Application description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setShowFullForm(false)
              setCarId("")
              form.reset()
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Application"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 