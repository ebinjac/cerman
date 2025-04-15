import { NextResponse } from "next/server"
import { db } from "@/db"
import { applications } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const applicationSchema = z.object({
  name: z.string().min(1),
  carid: z.string().min(1),
  tla: z.string().min(1),
  tier: z.string().min(1),
  engineeringDirector: z.string().min(1),
  engineeringVP: z.string().min(1),
  productionDirector: z.string().min(1),
  productionVP: z.string().min(1),
  snowGroup: z.string().optional(),
  contactEmail: z.string().email(),
  slack: z.string().optional(),
  confluence: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
})

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.teamId, params.teamId))

    return NextResponse.json(teamApplications)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    const newApplication = await db
      .insert(applications)
      .values({
        ...validatedData,
        teamId: params.teamId,
        createdBy: "system", // TODO: Replace with actual user
        updatedBy: "system", // TODO: Replace with actual user
      })
      .returning()

    return NextResponse.json(newApplication[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid application data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
} 