import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { z } from "zod";
import { sql } from "@/lib/db";

const verificationEmailInput = z.object({
	email: z.email(),
	name: z.string(),
	url: z.url(),
});

type VerificationEmailInput = z.infer<typeof verificationEmailInput>;

const UserPayload = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string().optional().nullable(),
});

const afterUserCreatedInput = z.object({
	user: UserPayload,
	organizationId: z.uuid(),
});

type AfterUserCreatedInput = z.infer<typeof afterUserCreatedInput>;

const sendInviteInput = z.object({
	id: z.uuid(),
	inviterName: z.string(),
	email: z.email(),
	organizationName: z.string(),
});

type SendInviteInput = z.infer<typeof sendInviteInput>;

export const accounts = restate.service({
	name: "Accounts",
	handlers: {
		sendVerificationEmail: async (
			ctx: restate.Context,
			{ email, name, url }: VerificationEmailInput,
		) => {
			await ctx.run("sendVerificationEmail", () =>
				sendVerificationEmail(email, name, url),
			);
			return "success";
		},

		afterUserCreated: async (
			ctx: restate.Context,
			{ user, organizationId }: AfterUserCreatedInput,
		) => {
			await ctx.run("ensureDefaultProject", () =>
				ensureDefaultProject(organizationId),
			);
			await ctx.run("welcome", () => sendWelcomeEmail(user));
			return "success";
		},

		sendOrganizationInvite: restate.createServiceHandler(
			{
				input: serde.zod(sendInviteInput),
				output: serde.zod(z.string()),
			},
			async (ctx: restate.Context, input) => {
				await ctx.run("sendInvitationEmail", () => sendInvitationEmail(input));
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

async function sendInvitationEmail(data: SendInviteInput) {
	console.log("Sending verification email", data);
}

export type AccountsService = typeof accounts;
export const Accounts: AccountsService = { name: "Accounts" };
