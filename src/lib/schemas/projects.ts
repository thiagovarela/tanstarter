import { z } from "zod";

export const createProjectSchema = z.object({
	name: z
		.string()
		.min(1, "Project name is required")
		.max(100, "Project name must be less than 100 characters"),
	description: z.string().optional(),
	organizationId: z.uuid().optional(),
	logo: z.string().url().optional(),
});

export const updateProjectSchema = z.object({
	name: z
		.string()
		.min(1, "Project name is required")
		.max(100, "Project name must be less than 100 characters")
		.optional(),
	description: z.string().optional(),
	logo: z.string().url().optional(),
});

export const projectQuerySchema = z.object({
	organizationId: z.uuid().optional(),
	archived: z.coerce.boolean().optional(),
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0),
	sort: z.enum(["name", "createdAt", "updatedAt"]).default("updatedAt"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export const projectIdSchema = z.object({
	projectId: z.uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type ProjectIdInput = z.infer<typeof projectIdSchema>;
