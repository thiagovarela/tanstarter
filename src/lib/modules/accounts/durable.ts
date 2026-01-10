import * as restate from "@restatedev/restate-sdk";
import { RestatePromise } from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { z } from "zod";
import { externalApiRetryOptions } from "@/lib/integrations/restate/retry-config";
import { AccountManager } from "./managers";
import {
	type AfterUserCreatedInput,
	type SendInviteInput,
	sendInviteInput,
	type VerificationEmailInput,
} from "./types";

export const accounts = restate.service({
	name: "Accounts",
	handlers: {
		sendVerificationEmail: async (
			ctx: restate.Context,
			{ email, name, url }: VerificationEmailInput,
		) => {
			// Named step for observability
			await ctx.run("sendVerificationEmail", () =>
				sendVerificationEmail(email, name, url),
			);
			return "success";
		},

		afterUserCreated: async (
			ctx: restate.Context,
			{ user, organizationId }: AfterUserCreatedInput,
		) => {
			// Parallel execution example - both tasks run concurrently
			const results = await RestatePromise.allSettled([
				ctx.run("ensureDefaultProject", () =>
					AccountManager.ensureDefaultProject(organizationId),
				),
				ctx.run("welcome", () => sendWelcomeEmail(user)),
			]);

			// Log any failures but don't fail the workflow
			const failures = results.filter((r) => r.status === "rejected");
			if (failures.length > 0) {
				console.warn("Some afterUserCreated tasks failed:", failures);
			}

			return "success";
		},

		sendOrganizationInvite: restate.createServiceHandler(
			{
				input: serde.zod(sendInviteInput),
				output: serde.zod(z.string()),
			},
			async (ctx: restate.Context, input) => {
				// Use retry options for external email API
				await ctx.run(
					"sendInvitationEmail",
					() => sendInvitationEmail(input),
					externalApiRetryOptions,
				);
				return "success";
			},
		),
	},
});

async function sendVerificationEmail(email: string, name: string, url: string) {
	console.log(`Sending verification email to ${name} ${email}`, url);
}

async function sendWelcomeEmail(user: { email: string; name?: string | null }) {
	console.log(`Sending welcome email to ${user.email}`);
}

async function sendInvitationEmail(data: SendInviteInput) {
	console.log("Sending invitation email", data);
}

export type AccountsService = typeof accounts;
export const Accounts: AccountsService = { name: "Accounts" };
