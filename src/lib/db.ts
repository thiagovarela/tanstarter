import postgres from "postgres";

import { env } from "./env";

export const sql = postgres(env.DATABASE_URL, {
	idle_timeout: 30,
	max: 20,
	transform: postgres.toCamel,
});

export const db = sql;
