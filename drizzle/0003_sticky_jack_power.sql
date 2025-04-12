ALTER TABLE "teams" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "rejected_at" timestamp;