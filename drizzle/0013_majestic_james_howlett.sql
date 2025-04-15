CREATE TABLE "certificate_plannings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"certificate_id" uuid NOT NULL,
	"planned_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"assigned_to" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"updated_by" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "certificate_plannings" ADD CONSTRAINT "certificate_plannings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_plannings" ADD CONSTRAINT "certificate_plannings_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE no action ON UPDATE no action;