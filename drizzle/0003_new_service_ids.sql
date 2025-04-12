-- Create new table with UUID
CREATE TABLE "service_ids_new" (
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
  "renewing_team_id" uuid NOT NULL,
  "change_number" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "service_ids_new_renewing_team_id_teams_id_fk" FOREIGN KEY ("renewing_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action
);

-- Copy data if exists (with UUID generation)
INSERT INTO "service_ids_new" (
  "id", "scid", "env", "application", "last_reset", "exp_date", "renewal_process",
  "status", "acknowledged_by", "app_custodian", "scid_owner", "app_aim_id",
  "description", "comment", "last_notification", "last_notification_on",
  "renewing_team_id", "change_number", "created_at", "updated_at"
)
SELECT 
  gen_random_uuid(), "scid", "env", "application", "last_reset", "exp_date", "renewal_process",
  "status", "acknowledged_by", "app_custodian", "scid_owner", "app_aim_id",
  "description", "comment", "last_notification", "last_notification_on",
  "renewing_team_id", "change_number", "created_at", "updated_at"
FROM "service_ids";

-- Drop old table
DROP TABLE IF EXISTS "service_ids";

-- Rename new table
ALTER TABLE "service_ids_new" RENAME TO "service_ids"; 