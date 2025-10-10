/**
 * 🗄️ DATABASE CONNECTION
 *
 * SQLite database with Drizzle ORM for vocabulary management
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Database URL - uses local SQLite for development, can be Turso for production
const databaseUrl = process.env.DATABASE_URL || 'file:./lexipop.db';

// Create SQLite client
const client = createClient({
  url: databaseUrl,
  // For production with Turso, add:
  // authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';