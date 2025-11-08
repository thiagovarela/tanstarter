import { drizzle } from "drizzle-orm/postgres-js";
import { createDbClient } from "./db";

export function createDrizzleClient(databaseUrl: string) {
	const sql = createDbClient(databaseUrl);
	return drizzle(sql, { casing: "snake_case" });
}

export const client = createDrizzleClient(process.env.DATABASE_URL!);
