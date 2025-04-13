import { checkAndSendNotifications } from './notificationScheduler';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class BackgroundService {
  private timer: NodeJS.Timeout | null = null;

  start() {
    // Only run on server side
    if (typeof window === 'undefined') {
      console.log('Starting background notification service...');
      
      // Run immediately on startup
      this.runCheck().catch(error => {
        console.error('Error in initial notification check:', error);
      });

      // Then run every 24 hours
      this.timer = setInterval(() => {
        this.runCheck().catch(error => {
          console.error('Error in periodic notification check:', error);
        });
      }, CHECK_INTERVAL);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runCheck() {
    try {
      console.log('Running scheduled notification check...');
      await checkAndSendNotifications();
      console.log('Scheduled notification check completed');
    } catch (error) {
      console.error('Error in scheduled notification check:', error);
    }
  }
}

// Create a singleton instance
export const backgroundService = new BackgroundService(); 