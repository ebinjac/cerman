"use server";

import { getDb } from "@/db/server";
import { teamsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTeam(
  teamId: string,
  data: {
    name: string;
    alert1: string;
    alert2: string;
    escalation: string;
  }
) {
  const db = await getDb();
  
  await db
    .update(teamsTable)
    .set({
      teamName: data.name,
      alert1: data.alert1,
      alert2: data.alert2,
      escalation: data.escalation,
      updatedAt: new Date(),
    })
    .where(eq(teamsTable.id, teamId));

  revalidatePath("/admin/teams");
}

export async function deleteTeam(teamId: string) {
  const db = await getDb();
  
  await db
    .update(teamsTable)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(teamsTable.id, teamId));

  revalidatePath("/admin/teams");
} 