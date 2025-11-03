import { afterAll, beforeEach } from "vitest";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

import type { Sql } from "postgres";

let container: StartedPostgreSqlContainer | undefined;
const existingDatabaseUrl = process.env.DATABASE_URL;

if (!existingDatabaseUrl) {
  try {
    container = await new PostgreSqlContainer("docker.io/postgres:18-alpine")
      .withDatabase("tanstarter_test")
      .withUsername("postgres")
      .withPassword("password")
      .start();
    process.env.DATABASE_URL = container.getConnectionUri();
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(
      [
        "[tests] Failed to start Postgres test container.",
        "Ensure Docker is running and accessible, or provide DATABASE_URL pointing to a test database.",
        `Original error: ${reason}`,
      ].join(" "),
    );
  }
} else {
  console.info(`[tests] Using provided DATABASE_URL=${existingDatabaseUrl}`);
}

const databaseUrl = process.env.DATABASE_URL;

process.env.RESTATE_URL ??= "http://localhost:8080";
process.env.GOOGLE_ID_CLIENT_ID ??= "vitest-google-client-id";
process.env.GOOGLE_ID_CLIENT_SECRET ??= "vitest-google-client-secret";
process.env.BETTER_AUTH_SECRET ??= "vitest-better-auth-secret";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";

let sqlClient: Sql | undefined;
let drizzleClient: typeof import("@/lib/drizzle").client | undefined;

const [{ sql }, { client }] = await Promise.all([
  import("@/lib/db"),
  import("@/lib/drizzle"),
]);

sqlClient = sql;
drizzleClient = client;

console.info(`[tests] PostgreSQL ready at ${databaseUrl}`);

await migrate(drizzleClient, {
  migrationsFolder: "./migrations",
});

beforeEach(async () => {
  if (!sqlClient) {
    throw new Error("SQL client not initialised");
  }

  await sqlClient`
		DO $$
		DECLARE
			stmt text;
		BEGIN
			SELECT string_agg(format('TRUNCATE TABLE %I.%I RESTART IDENTITY CASCADE', table_schema, table_name), '; ')
			INTO stmt
			FROM information_schema.tables
			WHERE table_schema = 'public'
			  AND table_type = 'BASE TABLE';

			IF stmt IS NOT NULL THEN
				EXECUTE stmt;
			END IF;
		END
		$$;
	`;
});

afterAll(async () => {
  await sqlClient?.end({ timeout: 0 });
  if (container) {
    await container.stop();
  }
});
