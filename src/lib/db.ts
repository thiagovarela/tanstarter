import { SQL } from "bun";

import { env } from "./env";

export const sql = new SQL(env.DATABASE_URL, {
	idleTimeout: 30,
	max: 20,
});

export const db = sql;
