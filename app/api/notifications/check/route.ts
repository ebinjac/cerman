import { checkAndSendNotifications } from '@/src/lib/notificationScheduler';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await checkAndSendNotifications();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking notifications:', error);
    return NextResponse.json(
      { error: 'Failed to check notifications' },
      { status: 500 }
    );
  }
} 