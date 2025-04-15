import { z } from "zod"
import { applications, teamsTable } from "./schema"

export type Team = typeof teamsTable.$inferSelect
export type NewTeam = typeof teamsTable.$inferInsert

export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert 