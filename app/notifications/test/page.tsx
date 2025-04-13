'use client';

import { useState, useEffect } from 'react';
import { checkAndSendNotifications } from '@/src/lib/notificationScheduler';
import { differenceInDays } from 'date-fns';

interface NotificationItem {
  id: string;
  name: string;
  type: 'certificate' | 'serviceId';
  expiryDate: string;
  daysRemaining: number;
  nextNotificationDay: number | null;
  daysUntilNextNotification: number | null;
  teamId: string | null;
}

export default function NotificationTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upcomingNotifications, setUpcomingNotifications] = useState<NotificationItem[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchUpcomingNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/upcoming');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUpcomingNotifications(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  };

  const handleManualCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkAndSendNotifications();
      setLastCheck(new Date());
      await fetchUpcomingNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingNotifications();
  }, []);

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 7) return 'bg-red-100 text-red-800';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notification Test Page</h1>
      
      <div className="mb-6">
        <button
          onClick={handleManualCheck}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Check for Notifications'}
        </button>
        {lastCheck && (
          <p className="mt-2 text-sm text-gray-600">
            Last checked: {lastCheck.toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {upcomingNotifications.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Type: {item.type === 'certificate' ? 'Certificate' : 'Service ID'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.daysRemaining)}`}>
                  {item.daysRemaining} days remaining
                </span>
                {item.nextNotificationDay !== null && (
                  <span className="mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Next notification in {item.daysUntilNextNotification} days
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm">
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 