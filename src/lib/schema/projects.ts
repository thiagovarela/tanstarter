import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./auth";
import { primaryKey } from "./primary-key";
import { ts } from "./timestamps";

export const projects = pgTable("projects", {
	...primaryKey,
	name: text("name").notNull(),
	logo: text("logo"),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	...ts,
	archived: boolean("archived").default(false),
});
