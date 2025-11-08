import postgres from "postgres";

export function createDbClient(databaseUrl: string) {
	return postgres(databaseUrl, {
		idle_timeout: 30,
		max: 20,
		transform: postgres.toCamel,
	});
}

export const sql = createDbClient(process.env.DATABASE_URL!);
export const db = sql;
