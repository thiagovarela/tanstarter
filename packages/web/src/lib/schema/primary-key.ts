import { sql } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

export const primaryKey = {
	id: uuid("id").default(sql`uuidv7()`).primaryKey(),
};
