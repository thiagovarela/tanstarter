import { createAuthServerFn } from "@/lib/auth-server-fn";
import { sql } from "@/lib/db";
import type { Organization } from "./types";

export const listOrganizations = createAuthServerFn().handler(
	async ({ context }): Promise<Organization[]> => {
		const userId = context.user.id;

		return await sql<Organization[]>`
			select o.id, o.name, o.slug, o.created_at
			from organizations o
			inner join members m on m.organization_id = o.id
			where m.user_id = ${userId}
			order by o.created_at desc
		`;
	},
);
