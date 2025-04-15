import { sql } from "drizzle-orm"
import { pgTable, text, uuid, boolean, timestamp, json } from "drizzle-orm/pg-core"

export async function up(db: any) {
  // Create applications table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      car_id TEXT NOT NULL,
      tla TEXT NOT NULL,
      tier TEXT NOT NULL,
      engineering_director TEXT NOT NULL,
      engineering_vp TEXT NOT NULL,
      production_director TEXT NOT NULL,
      production_vp TEXT NOT NULL,
      snow_group TEXT,
      team_email TEXT NOT NULL,
      slack TEXT,
      confluence TEXT,
      description TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_by TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true
    );
  `)

  // Create index on team_id for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS applications_team_id_idx ON applications(team_id);
  `)

  // Create index on car_id for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS applications_car_id_idx ON applications(car_id);
  `)

  // Create index on tla for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS applications_tla_idx ON applications(tla);
  `)
}

export async function down(db: any) {
  // Drop applications table
  await db.execute(sql`
    DROP TABLE IF EXISTS applications;
  `)
} 