import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";

// postgres.js connects lazily, so constructing this at import time is safe
// even during build when the DB isn't reachable.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
