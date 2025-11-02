import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import type { User } from "better-auth";
import { z } from "zod";
import { sql } from "@/lib/db";

const VerificationEmailInput = z.object({
	email: z.email(),
	name: z.string(),
	url: z.url(),
});

export const accounts = restate.service({
	name: "Accounts",
	handlers: {
		sendVerificationEmail: restate.createServiceHandler(
			{
				input: serde.zod(VerificationEmailInput),
				output: serde.zod(z.string()),
			},
			async (ctx: restate.Context, { email, name, url }) => {
				await ctx.run("sendVerificationEmail", () =>
					sendVerificationEmail(email, name, url),
				);
				return "success";
			},
		),
		createDefaults: async (ctx: restate.Context, user) => {
			await ctx.run("createDefaults", () => createDefaults(user));
			await ctx.run("welcome", () => sendWelcomeEmail(user));
			return "yay";
		},
	},
});

async function sendVerificationEmail(email: string, name: string, url: string) {
	console.log(`Sending verification email to ${name} ${email}`, url);
}

async function createDefaults(user: User) {
	return await sql.begin(async (tx) => {
		const orgData = {
			name: `${user.name}'s Organization`,
			slug: Bun.randomUUIDv7(),
		};
		const [organization] = await tx`
      insert into organizations ${sql(orgData)}
      returning *
    `;
		const projectData = {
			name: `Default Project`,
			organization_id: organization.id,
		};
		const [project] = await tx`
      insert into projects ${sql(projectData)}
      returning *
    `;
		return [organization, project];
	});
}

async function sendWelcomeEmail(user: User) {
	console.log(`Sending welcome email to ${user}`);
}

export type AccountsService = typeof accounts;
export const Accounts: AccountsService = { name: "Accounts" };
