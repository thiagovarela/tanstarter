import { createServerFn } from "@tanstack/react-start";

import { sql } from "@/lib/db";

type OrganizationRow = {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
};

export const listOrganizations = createServerFn().handler(
	async ({ context }) => {
		const session = context.session;
		const userId = session?.user?.id;

		if (!userId) {
			throw new Response("Unauthorized", { status: 401 });
		}

		return await sql<OrganizationRow[]>`
			select o.id, o.name, o.slug, o.created_at
			from organizations o
			inner join members m on m.organization_id = o.id
			where m.user_id = ${userId}
			order by o.created_at desc
		`;
	},
);
