'use client';

import { useState, useEffect } from 'react';
import { checkAndSendNotifications } from '@/src/lib/notificationScheduler';
import { NotificationHistoryTable } from '@/src/components/NotificationHistoryTable';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationHistory {
  id: string;
  itemId: string;
  itemType: 'certificate' | 'serviceId';
  itemName: string;
  teamId: string;
  teamName: string;
  daysUntilExpiry: string;
  notificationType: string;
  recipients: string;
  sentAt: string;
  status: 'success' | 'failed';
  errorMessage: string | null;
  triggeredBy: 'system' | 'admin';
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [lastTrigger, setLastTrigger] = useState<Date | null>(null);

  const fetchNotificationHistory = async () => {
    try {
      const response = await fetch('/api/admin/notifications/history');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNotificationHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification history');
    }
  };

  const handleManualTrigger = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkAndSendNotifications('admin');
      setLastTrigger(new Date());
      await fetchNotificationHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <Button
          onClick={handleManualTrigger}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Notifications Now'}
        </Button>
      </div>

      {lastTrigger && (
        <p className="text-sm text-muted-foreground mb-4">
          Last triggered: {lastTrigger.toLocaleString()}
        </p>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <NotificationHistoryTable data={notificationHistory} />
    </div>
  );
} 