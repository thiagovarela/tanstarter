import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";
import { primaryKey } from "./primary-key";
import { ts } from "./timestamps";

export const users = pgTable("users", {
	...primaryKey,
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	...ts,
	isAnonymous: boolean("is_anonymous"),
	lastLoginMethod: text("last_login_method"),
	role: text("role"),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
});

export const userSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	emailVerified: z.boolean(),
	name: z.string(),
	image: z.string().optional().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const sessions = pgTable("sessions", {
	...primaryKey,
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	...ts,
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
	activeOrganizationId: text("active_organization_id"),
});

export const accounts = pgTable("accounts", {
	...primaryKey,
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	...ts,
});

export const verifications = pgTable("verifications", {
	...primaryKey,
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	...ts,
});

export const organizations = pgTable("organizations", {
	...primaryKey,
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	metadata: text("metadata"),
});

export type Organization = typeof organizations.$inferSelect;

export const members = pgTable("members", {
	...primaryKey,
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role").default("member").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const invitations = pgTable("invitations", {
	...primaryKey,
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").default("pending").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: uuid("inviter_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});
