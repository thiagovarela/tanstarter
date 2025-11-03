import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, lastLoginMethod } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { reactStartCookies } from "better-auth/react-start";

import { client } from "@/lib/drizzle";
import * as schema from "@/lib/schema/auth";

import { env } from "./env";
import {
	ensureDefaultOrganizationForUser,
	getActiveOrganizationForUser,
} from "./organizations/provision";
import { restateClient } from "./restate-client";
import { Accounts } from "./workflows";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
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
		requireEmailVerification: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await restateClient
				.serviceClient(Accounts)
				.sendVerificationEmail({ email: user.email, name: user.name, url });
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					const { id: organizationId } =
						await ensureDefaultOrganizationForUser(user);

					try {
						await restateClient.serviceClient(Accounts).afterUserCreated({
							user,
							organizationId,
						});
					} catch (error) {
						console.error("Failed to trigger afterUserCreated workflow", error);
					}
				},
			},
		},
		session: {
			create: {
				before: async (session) => {
					let organizationId = null;
					if (session.activeOrganizationId) {
						organizationId = session.activeOrganizationId;
					}

					const organization = await getActiveOrganizationForUser(
						session.userId,
					);
					if (organization) {
						organizationId = organization.id;
					}

					return {
						data: {
							...session,
							activeOrganizationId: organizationId,
						},
					};
				},
			},
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_ID_CLIENT_ID,
			clientSecret: env.GOOGLE_ID_CLIENT_SECRET,
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
