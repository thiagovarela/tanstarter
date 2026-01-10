import { z } from "zod";

export const verificationEmailInput = z.object({
	email: z.email(),
	name: z.string(),
	url: z.url(),
});

export type VerificationEmailInput = z.infer<typeof verificationEmailInput>;

export const userPayload = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string().optional().nullable(),
});

export type UserPayload = z.infer<typeof userPayload>;

export const afterUserCreatedInput = z.object({
	user: userPayload,
	organizationId: z.uuid(),
});

export type AfterUserCreatedInput = z.infer<typeof afterUserCreatedInput>;

export const sendInviteInput = z.object({
	id: z.uuid(),
	inviterName: z.string(),
	email: z.email(),
	organizationName: z.string(),
});

export type SendInviteInput = z.infer<typeof sendInviteInput>;
