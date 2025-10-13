import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __drizzleDb__: ReturnType<typeof drizzle> | undefined;
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

/**
 * Use a single Pool/db instance during dev (Next.js hot reload creates modules multiple times).
 */
function getPool() {
  if (!global.__pgPool__) {
    global.__pgPool__ = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Optional tuning:
      // max: 10,
      // idleTimeoutMillis: 30_000,
      // connectionTimeoutMillis: 5_000,
      // ssl: { rejectUnauthorized: false }, // if your provider requires it
    });
  }
  return global.__pgPool__;
}

export const db =
  global.__drizzleDb__ ?? drizzle(getPool());

if (process.env.NODE_ENV !== "production") {
  global.__drizzleDb__ = db;
}
