import { z } from "zod";

// Organization types
export type Organization = {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
};

export type OrganizationMember = {
	id: string;
	name: string | null;
	email: string;
	role: string;
	joinedAt: string;
	mfaEnabled: boolean;
	avatarUrl: string | null;
};

export type OrganizationDetail = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	createdAt: string;
	members: OrganizationMember[];
};

// Reusable schema parts
export const organizationNameSchema = z
	.string()
	.trim()
	.min(2, "Team name must be at least 2 characters")
	.max(64, "Team name must be at most 64 characters");

// Input schemas
export const getOrganizationSchema = z.object({
	organizationId: z.uuid(),
});

export const updateOrganizationSchema = z.object({
	organizationId: z.uuid(),
	name: organizationNameSchema,
	logo: z
		.string()
		.trim()
		.min(1, "Logo key is required")
		.max(512, "Logo key is too long")
		.nullable()
		.optional(),
});

export const inviteOrganizationMemberSchema = z.object({
	organizationId: z.uuid(),
	email: z.email("Enter a valid email address"),
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(64, "Name must be at most 64 characters")
		.optional(),
	role: z.enum(["admin", "member"], {
		message: "Select a valid role",
	}),
});

export type GetOrganizationInput = z.infer<typeof getOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteOrganizationMemberInput = z.infer<
	typeof inviteOrganizationMemberSchema
>;
