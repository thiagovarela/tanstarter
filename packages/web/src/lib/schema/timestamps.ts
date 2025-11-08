import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const ts = {
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at")
		.default(sql`now()`)
		.$onUpdate(() => new Date())
		.notNull(),
};
