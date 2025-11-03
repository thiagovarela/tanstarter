import { createServerFn } from "@tanstack/react-start";

import { sql } from "@/lib/db";

import type { Organization } from "./types";

type OrganizationRow = {
	id: string;
	name: string;
	slug: string;
	created_at: Date;
};

export const listOrganizations = createServerFn().handler(
	async ({ context }) => {
		const session = context.session;
		const userId = session?.user?.id;

		if (!userId) {
			throw new Response("Unauthorized", { status: 401 });
		}

		const rows = await sql<OrganizationRow[]>`
			select o.id, o.name, o.slug, o.created_at
			from organizations o
			inner join members m on m.organization_id = o.id
			where m.user_id = ${userId}
			order by o.created_at desc
		`;

		return rows.map(
			(row): Organization => ({
				id: row.id,
				name: row.name,
				slug: row.slug,
				createdAt: row.created_at.toISOString(),
			}),
		);
	},
);
