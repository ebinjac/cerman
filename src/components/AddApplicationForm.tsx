"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createApplication } from "@/app/actions"

interface AddApplicationFormProps {
  teamId: string
}

// Mock function to simulate fetching application details from central API
async function fetchApplicationDetails(carId: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock response
  return {
    name: `Application ${carId}`,
    carid: carId,
    tla: `TLA${carId.slice(0, 3)}`,
    tier: "T1",
    engineeringDirector: "John Doe",
    engineeringVP: "Jane Smith",
    productionDirector: "Mike Johnson",
    productionVP: "Sarah Williams",
    snowGroup: `SNOW-${carId}`,
    contactEmail: `team-${carId}@example.com`,
    slack: `#${carId}-channel`,
    confluence: `https://confluence.example.com/${carId}`,
    description: `Description for application ${carId}`,
    isActive: true
  }
}

export function AddApplicationForm({ teamId }: AddApplicationFormProps) {
  const router = useRouter()
  const [carId, setCarId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carId.trim()) {
      toast.error("Please enter a CAR ID")
      return
    }

    setIsLoading(true)
    try {
      // Fetch application details from central API
      const applicationDetails = await fetchApplicationDetails(carId)
      
      // Create application with the fetched details
      await createApplication({
        ...applicationDetails,
        teamId,
        metadata: {}
      })

      toast.success("Application added successfully")
      setCarId("")
      router.refresh()
    } catch (error) {
      toast.error("Failed to add application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter CAR ID"
        value={carId}
        onChange={(e) => setCarId(e.target.value)}
        className="max-w-sm"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Application"}
      </Button>
    </form>
  )
} 