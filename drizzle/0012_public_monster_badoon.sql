CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"carid" text NOT NULL,
	"tla" text NOT NULL,
	"tier" text NOT NULL,
	"engineering_director" text NOT NULL,
	"engineering_vp" text NOT NULL,
	"production_director" text NOT NULL,
	"production_vp" text NOT NULL,
	"snow_group" text NOT NULL,
	"contact_email" text NOT NULL,
	"slack" text NOT NULL,
	"confluence" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;