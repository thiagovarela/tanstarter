import { beforeAll, afterAll, beforeEach } from "bun:test";
import { migrate } from "drizzle-orm/bun-sql/migrator";

const databaseUrl = Bun.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		[
			"[tests] DATABASE_URL is not set.",
			"Start the test services with:",
			"  docker compose -f docker-compose-test.yml up -d",
			"and export DATABASE_URL=postgres://postgres:password@localhost:55432/tanstarter_test before running `bun test`.",
		].join("\n"),
	);
}

let sqlClient: import("bun").SQL | undefined;
let drizzleClient: typeof import("@/lib/drizzle").client | undefined;

beforeAll(async () => {
	const [{ sql }, { client }] = await Promise.all([
		import("@/lib/db"),
		import("@/lib/drizzle"),
	]);

	sqlClient = sql;
	drizzleClient = client;

	console.info(`[tests] using DATABASE_URL=${databaseUrl}`);
	await migrate(drizzleClient, {
		migrationsFolder: "./migrations",
	});
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
	await sqlClient?.close();
});

export {};
