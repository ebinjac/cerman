import { NextResponse } from 'next/server';
import { getDb } from '@/db/server';
import { notificationHistory, teamsTable } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDb();
    
    const history = await db
      .select({
        id: notificationHistory.id,
        itemId: notificationHistory.itemId,
        itemType: notificationHistory.itemType,
        itemName: notificationHistory.itemName,
        teamId: notificationHistory.teamId,
        teamName: teamsTable.teamName,
        daysUntilExpiry: notificationHistory.daysUntilExpiry,
        notificationType: notificationHistory.notificationType,
        recipients: notificationHistory.recipients,
        sentAt: notificationHistory.sentAt,
        status: notificationHistory.status,
        errorMessage: notificationHistory.errorMessage,
        triggeredBy: notificationHistory.triggeredBy,
      })
      .from(notificationHistory)
      .leftJoin(teamsTable, eq(notificationHistory.teamId, teamsTable.id))
      .orderBy(desc(notificationHistory.sentAt))
      .limit(100);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
} 