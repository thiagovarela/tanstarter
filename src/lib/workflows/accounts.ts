import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { z } from "zod";
import { sql } from "@/lib/db";

const VerificationEmailInput = z.object({
	email: z.email(),
	name: z.string(),
	url: z.url(),
});

const UserPayload = z
	.object({
		id: z.uuid(),
		email: z.email(),
		name: z.string().optional().nullable(),
	})
	.loose();

const AfterUserCreatedInput = z.object({
	user: UserPayload,
	organizationId: z.uuid(),
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
		afterUserCreated: restate.createServiceHandler(
			{
				input: serde.zod(AfterUserCreatedInput),
				output: serde.zod(z.string()),
			},
			async (ctx: restate.Context, { user, organizationId }) => {
				await ctx.run("ensureDefaultProject", () =>
					ensureDefaultProject(organizationId),
				);
				await ctx.run("welcome", () => sendWelcomeEmail(user));
				return "success";
			},
		),
	},
});

async function sendVerificationEmail(email: string, name: string, url: string) {
	console.log(`Sending verification email to ${name} ${email}`, url);
}

async function ensureDefaultProject(organizationId: string) {
	const [existingProject] = await sql`
			select id
			from projects
			where organization_id = ${organizationId}
			limit 1
		`;

	if (existingProject) {
		return existingProject.id;
	}

	const [project] = await sql`
			insert into projects ${sql({
				name: "Default Project",
				organization_id: organizationId,
			})}
			returning id
		`;

	return project.id;
}

async function sendWelcomeEmail(user: { email: string; name?: string | null }) {
	console.log(`Sending welcome email to ${user.email}`);
}

export type AccountsService = typeof accounts;
export const Accounts: AccountsService = { name: "Accounts" };
