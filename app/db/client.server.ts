import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "~/config/env";

type DatabaseGlobals = {
  pool?: Pool;
};

const databaseGlobals = globalThis as typeof globalThis & DatabaseGlobals;
const pool = databaseGlobals.pool ?? new Pool({ connectionString: env.databaseUrl });

if (process.env.NODE_ENV !== "production") {
  databaseGlobals.pool = pool;
}

export const db = drizzle({ client: pool });
