import { SQL } from "bun";

export const sql = new SQL(Bun.env.DATABASE_URL!, {
	idleTimeout: 30,
	max: 20,
});
