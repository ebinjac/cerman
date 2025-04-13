import { getDb } from "@/db/server";
import { teamsTable } from "@/db/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    await db.select({ count: count() }).from(teamsTable).limit(1);
    return NextResponse.json({ status: "up" });
  } catch (error) {
    return NextResponse.json({ status: "down" });
  }
} 