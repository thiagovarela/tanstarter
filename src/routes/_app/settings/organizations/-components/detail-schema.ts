import { z } from "zod";

export const organizationNameSchema = z
	.string()
	.trim()
	.min(2, "Team name must be at least 2 characters")
	.max(64, "Team name must be at most 64 characters");

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
