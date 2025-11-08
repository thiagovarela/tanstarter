import * as schema from "@tanstarter/data";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, lastLoginMethod } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { reactStartCookies } from "better-auth/react-start";
import { client } from "@/lib/drizzle";

import { ac, roles } from "./auth/permissions";
import { env } from "./env";
import {
	ensureDefaultOrganizationForUser,
	getActiveOrganizationForUser,
} from "./organizations/provision";
import { restate, restateClient } from "./restate-client";
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
		requireEmailVerification: false,
	},
	emailVerification: {
		sendOnSignUp: false,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await restateClient
				.serviceClient(Accounts)
				.sendVerificationEmail(
					{ email: user.email, name: user.name, url },
					restate.rpc.opts({ idempotencyKey: user.id }),
				);
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					const { id: organizationId } =
						await ensureDefaultOrganizationForUser(user);

					try {
						await restateClient.serviceClient(Accounts).afterUserCreated(
							{
								user,
								organizationId,
							},
							restate.rpc.opts({ idempotencyKey: user.id }),
						);
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
			scope: ["openid", "profile", "email"],
		},
	},
	plugins: [
		anonymous({ emailDomainName: "anonymous.com" }),
		lastLoginMethod({ storeInDatabase: true }),
		admin(),
		organization({
			ac,
			roles,
			sendInvitationEmail: async (data) => {
				await restateClient.serviceClient(Accounts).sendOrganizationInvite(
					{
						id: data.id,
						email: data.email,
						inviterName: data.inviter.user.name,
						organizationName: data.organization.name,
					},
					restate.rpc.opts({ idempotencyKey: data.id }),
				);
			},
		}),
		reactStartCookies(),
	],
});

export type AuthInstance = typeof auth;
