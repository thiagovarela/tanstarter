import { reactStartCookies } from "better-auth/react-start";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { anonymous } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { createServerFn } from "@tanstack/react-start";

import { client } from "@/lib/drizzle";
import * as schema from "@/lib/schema/auth";

export const auth = betterAuth({
	secret: Bun.env.BETTER_AUTH_SECRET,
	baseURL: Bun.env.BETTER_AUTH_URL,
	basePath: "/api/auth",
	advanced: {
		database: {
			generateId: false,
		},
	},
	database: drizzleAdapter(client, {
		provider: "pg",
		usePlural: true,
		camelCase: false,
		debugLogs: false,
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: Bun.env.GOOGLE_ID_CLIENT_ID!,
			clientSecret: Bun.env.GOOGLE_ID_CLIENT_SECRET!,
			redirectURI: "api/auth/google/callback",
			scope: ["openid", "profile", "email"],
		},
	},
	plugins: [
		anonymous({ emailDomainName: "anonymous.com" }),
		lastLoginMethod({ storeInDatabase: true }),
		admin(),
		organization(),
		reactStartCookies(),
	],
});

export type AuthInstance = typeof auth;
