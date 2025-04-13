CREATE TABLE "notification_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"item_type" text NOT NULL,
	"item_name" text NOT NULL,
	"team_id" text NOT NULL,
	"days_until_expiry" text NOT NULL,
	"notification_type" text NOT NULL,
	"recipients" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"triggered_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "notification_emails" text DEFAULT '[]' NOT NULL;