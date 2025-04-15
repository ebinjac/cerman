import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create and export a single db instance
export const db = drizzle(process.env.DATABASE_URL, { schema }); 