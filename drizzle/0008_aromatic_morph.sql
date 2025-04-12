CREATE TABLE "service_ids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scid" text NOT NULL,
	"env" text NOT NULL,
	"application" text NOT NULL,
	"last_reset" date,
	"exp_date" date NOT NULL,
	"renewal_process" text NOT NULL,
	"status" text NOT NULL,
	"acknowledged_by" text,
	"app_custodian" text,
	"scid_owner" text,
	"app_aim_id" text,
	"description" text,
	"comment" text,
	"last_notification" integer,
	"last_notification_on" date,
	"renewing_team_id" uuid,
	"change_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "service_ids" ADD CONSTRAINT "service_ids_renewing_team_id_teams_id_fk" FOREIGN KEY ("renewing_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;