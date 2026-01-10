import { requireOrgPermission } from "@/lib/auth/org-permissions";
import { createAuthServerFn } from "@/lib/auth-server-fn";
import { requireOrgUserMiddleware } from "@/lib/middleware";
import { ProjectManager } from "./managers";
import {
	type CreateProjectResponse,
	createProjectInput,
	deleteProjectInput,
	type ProjectListResponse,
	updateProjectInput,
} from "./types";

export const listActiveOrganizationProjects = createAuthServerFn()
	.middleware([requireOrgUserMiddleware])
	.handler(async ({ context }): Promise<ProjectListResponse> => {
		const projects = await ProjectManager.list(
			context.user.id,
			context.activeOrganizationId,
		);

		return { projects };
	});

export const createProject = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(createProjectInput)
	.handler(async ({ context, data }): Promise<CreateProjectResponse> => {
		const activeOrganizationId = context.activeOrganizationId;

		await requireOrgPermission({
			userId: context.user.id,
			organizationId: activeOrganizationId,
			permissions: {
				project: "create",
			},
			errorMessage: "You do not have permission to create projects.",
		});

		const project = await ProjectManager.create(activeOrganizationId, data);

		return {
			project: {
				id: project.id,
				name: project.name,
				organizationId: activeOrganizationId,
				logo: project.logo,
				archived: project.archived,
				createdAt: new Date(project.createdAt).toISOString(),
				updatedAt: new Date(project.updatedAt).toISOString(),
			},
		};
	});

export const updateProject = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(updateProjectInput)
	.handler(async ({ context, data }) => {
		const activeOrganizationId = context.activeOrganizationId;

		await requireOrgPermission({
			userId: context.user.id,
			organizationId: activeOrganizationId,
			permissions: {
				project: "update",
			},
			errorMessage: "You do not have permission to update projects.",
		});

		const { projectId, ...changes } = data;
		const project = await ProjectManager.update(
			projectId,
			activeOrganizationId,
			changes,
		);

		if (!project) {
			throw new Error("Project not found or no changes made.");
		}

		return { success: true };
	});

export const deleteProject = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(deleteProjectInput)
	.handler(async ({ context, data }) => {
		const activeOrganizationId = context.activeOrganizationId;

		await requireOrgPermission({
			userId: context.user.id,
			organizationId: activeOrganizationId,
			permissions: {
				project: "delete",
			},
			errorMessage: "You do not have permission to delete projects.",
		});

		const deleted = await ProjectManager.delete(
			data.projectId,
			activeOrganizationId,
		);

		if (!deleted) {
			throw new Error("Project not found.");
		}

		return { success: true };
	});
