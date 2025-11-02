import { sql } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./auth";
import { ts } from "./timestamps";

export const projects = pgTable("projects", {
	id: uuid("id").default(sql`uuidv7()`).primaryKey(),
	name: text("name").notNull(),
	logo: text("logo"),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	...ts,
	archived: boolean("archived").default(false),
});
