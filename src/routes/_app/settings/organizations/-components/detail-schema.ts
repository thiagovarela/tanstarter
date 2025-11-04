import { z } from "zod";

export const organizationNameSchema = z
	.string()
	.trim()
	.min(2, "Team name must be at least 2 characters")
	.max(64, "Team name must be at most 64 characters");

export const updateOrganizationSchema = z.object({
	organizationId: z.string().uuid(),
	name: organizationNameSchema,
});
