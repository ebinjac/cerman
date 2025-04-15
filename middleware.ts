import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";
import { db } from "./src/db/client";
import { teamsTable } from "./src/db/schema";
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  const { session } = await getSession(request);
  const path = request.nextUrl.pathname;

  // Allow access to login page and public assets
  if (path.startsWith('/login') || path.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Existing team authorization logic
  if (path.startsWith('/teams/')) {
    const teamId = path.split('/')[2];
    const result = await db.select()
      .from(teamsTable)
      .where(eq(teamsTable.id, teamId))
      .execute();

    const team = result[0];
    if (!team) return NextResponse.next();

    if (!session.user.groups.includes(team.prcGroup!)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}