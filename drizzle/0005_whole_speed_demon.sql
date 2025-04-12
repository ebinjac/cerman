ALTER TABLE "certificates" ALTER COLUMN "environment" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "zero_touch" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "zero_touch" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "hosting_team" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "application_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "request_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "requested_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "requested_for" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "approved_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "request_channel" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "ta_client" SET NOT NULL;