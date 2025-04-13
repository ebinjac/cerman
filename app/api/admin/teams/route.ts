import { getDb } from "@/db/server";
import { teamsTable } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const data = await request.json();

    const newTeam = await db.insert(teamsTable).values({
      teamName: data.teamName,
      alert1: data.alert1,
      alert2: data.alert2,
      alert3: data.alert3,
      escalation: data.escalation,
      createdBy: "admin", // TODO: Replace with actual user ID from session
      deletedAt: data.isActive ? null : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
} 