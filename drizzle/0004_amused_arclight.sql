CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"team_id" uuid
);
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "last_updated" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;