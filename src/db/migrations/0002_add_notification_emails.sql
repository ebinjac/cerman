-- Add notification_emails column to teams table
ALTER TABLE teams ADD COLUMN notification_emails text NOT NULL DEFAULT '[]'; 