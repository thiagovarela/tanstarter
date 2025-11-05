import { createAuthServerFn } from "@/lib/auth-server-fn";
import { sql } from "@/lib/db";

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

		return {
			projects: rows,
		};
	},
);
