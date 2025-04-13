import { NextResponse } from 'next/server';
import { getDb } from '@/db/server';
import { eq, and, lte, gt, isNull, sql } from 'drizzle-orm';
import { certificatesTable, serviceIds } from '@/db/schema';
import { addDays, differenceInDays } from 'date-fns';

const NOTIFICATION_DAYS = [90, 60, 30, 15, 7, 1];

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDb();
    const maxDays = 90; // Maximum days to look ahead
    const now = new Date();

    // Get expiring certificates
    const certificates = await db
      .select({
        id: certificatesTable.id,
        name: certificatesTable.commonName,
        expiryDate: certificatesTable.validTo,
        teamId: certificatesTable.teamId,
      })
      .from(certificatesTable)
      .where(
        and(
          isNull(certificatesTable.deletedAt),
          lte(certificatesTable.validTo, addDays(now, maxDays)),
          gt(certificatesTable.validTo, now)
        )
      );

    // Get expiring service IDs
    const svcIds = await db
      .select({
        id: serviceIds.id,
        name: serviceIds.svcid,
        expiryDate: serviceIds.expDate,
        teamId: serviceIds.renewingTeamId,
      })
      .from(serviceIds)
      .where(
        and(
          lte(serviceIds.expDate, sql`${addDays(now, maxDays).toISOString().split('T')[0]}`),
          gt(serviceIds.expDate, sql`${now.toISOString().split('T')[0]}`)
        )
      );

    // Combine and format the results
    const items = [
      ...certificates.map(cert => {
        const expiryDate = new Date(cert.expiryDate);
        const daysRemaining = Math.max(0, differenceInDays(expiryDate, now));
        const nextNotificationDay = NOTIFICATION_DAYS.find(day => day <= daysRemaining) || null;
        return {
          ...cert,
          type: 'certificate' as const,
          daysRemaining,
          nextNotificationDay,
          daysUntilNextNotification: nextNotificationDay ? daysRemaining - nextNotificationDay : null
        };
      }),
      ...svcIds.map(sid => {
        const expiryDate = new Date(sid.expiryDate);
        const daysRemaining = Math.max(0, differenceInDays(expiryDate, now));
        const nextNotificationDay = NOTIFICATION_DAYS.find(day => day <= daysRemaining) || null;
        return {
          ...sid,
          type: 'serviceId' as const,
          daysRemaining,
          nextNotificationDay,
          daysUntilNextNotification: nextNotificationDay ? daysRemaining - nextNotificationDay : null
        };
      })
    ];

    // Sort by days until expiry
    items.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching upcoming notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming notifications' },
      { status: 500 }
    );
  }
} 