import { z } from "zod";

// Input schemas
export const createProjectInput = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Project name is required")
		.max(100, "Project name must be less than 100 characters"),
});

export type CreateProjectInput = z.infer<typeof createProjectInput>;

export const updateProjectInput = z.object({
	projectId: z.uuid(),
	name: z.string().trim().min(1).max(100).optional(),
	archived: z.boolean().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectInput>;

export const deleteProjectInput = z.object({
	projectId: z.uuid(),
});

export type DeleteProjectInput = z.infer<typeof deleteProjectInput>;

// Response types
export type ProjectListItem = {
	id: string;
	name: string;
	organizationId: string;
	logo: string | null;
	archived: boolean;
	updatedAt: Date;
	createdAt: Date;
};

export type ProjectListResponse = {
	projects: ProjectListItem[];
};

export type CreateProjectResponse = {
	project: {
		id: string;
		name: string;
		organizationId: string;
		logo: string | null;
		archived: boolean;
		createdAt: string;
		updatedAt: string;
	};
};
