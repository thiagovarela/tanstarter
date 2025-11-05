import { z } from "zod";
import { requireOrgPermission } from "@/lib/auth/org-permissions";
import { createAuthServerFn } from "@/lib/auth-server-fn";
import { sql } from "@/lib/db";
import { requireOrgUserMiddleware } from "@/lib/middleware";

export type ProjectListItem = {
	id: string;
	name: string;
	organizationId: string;
	organizationName: string;
	logo: string | null;
	archived: boolean;
	updatedAt: string;
	createdAt: string;
};

export type ProjectListResponse = {
	projects: ProjectListItem[];
};

export const listActiveOrganizationProjects = createAuthServerFn().handler(
	async ({ context }): Promise<ProjectListResponse> => {
		const activeOrganizationId =
			context.session.session.activeOrganizationId ?? null;

		if (!activeOrganizationId) {
			return {
				projects: [],
			};
		}

		const rows = await sql`
			select
				p.id,
				p.name,
				p.logo,
				p.archived,
				p.created_at,
				p.updated_at,
				o.id as organization_id,
				o.name as organization_name
			from projects p
			inner join organizations o on o.id = p.organization_id
			inner join members m on m.organization_id = p.organization_id
			where m.user_id = ${context.user.id}
			and p.organization_id = ${activeOrganizationId}
			order by p.updated_at desc
		`;

		const toIsoString = (value: unknown): string =>
			new Date(value as never).toISOString();

		return {
			projects: rows.map((project) => ({
				id: project.id,
				name: project.name,
				organizationId: project.organizationId,
				organizationName: project.organizationName,
				logo: project.logo ?? null,
				archived: Boolean(project.archived),
				createdAt: toIsoString(project.createdAt),
				updatedAt: toIsoString(project.updatedAt),
			})),
		};
	},
);

const createProjectInput = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Project name is required")
		.max(100, "Project name must be less than 100 characters"),
});

export const createProject = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(createProjectInput)
	.handler(async ({ context, data }) => {
		const activeOrganizationId =
			context.session.session.activeOrganizationId ?? null;

		if (!activeOrganizationId) {
			throw new Error("Select an organization before creating a project.");
		}

		await requireOrgPermission({
			userId: context.user.id,
			organizationId: activeOrganizationId,
			permissions: {
				project: "create",
			},
			errorMessage: "You do not have permission to create projects.",
		});

		const trimmedName = data.name.trim();
		const rows = await sql`
			insert into projects (name, organization_id)
			values (${trimmedName}, ${activeOrganizationId})
			returning id, name, logo, archived, created_at, updated_at
		`;

		const [project] = rows;
		if (!project) {
			throw new Error("Failed to create project.");
		}

		const [organization] = await sql`
			select name from organizations where id = ${activeOrganizationId} limit 1
		`;

		return {
			project: {
				id: project.id,
				name: project.name,
				organizationId: activeOrganizationId,
				organizationName: organization?.name ?? "",
				logo: project.logo ?? null,
				archived: Boolean(project.archived),
				createdAt: new Date(project.createdAt as never).toISOString(),
				updatedAt: new Date(project.updatedAt as never).toISOString(),
			},
		};
	});
