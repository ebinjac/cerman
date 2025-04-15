'use server';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a single pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Disable SSL for local development
  ssl: false,
  // Disable pg-native
});

// Create a single drizzle instance
const db = drizzle(pool, { schema });

// Export an async function to get the database instance
export async function getDb() {
  if (typeof window !== 'undefined') {
    throw new Error('This module can only be imported in server components');
  }
  return db;
} 