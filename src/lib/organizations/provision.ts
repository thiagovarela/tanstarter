import type { User } from "better-auth";
import { sql } from "@/data";
import { randomName } from "@/lib/unique-names";

type ProvisionedOrganization = {
	id: string;
	name: string;
	created: boolean;
};

type OrganizationMembership = { id: string; name: string } | undefined;
type OrganizationRow = {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
};

const MAX_ATTEMPTS = 5;

const OWNER_ROLE = "owner";

function toSlug(raw: string) {
	return raw
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function ensureDefaultOrganizationForUser(
	user: User,
): Promise<ProvisionedOrganization> {
	const existingMembership = await getActiveOrganizationForUser(user.id);
	if (existingMembership) {
		return {
			id: existingMembership.id,
			name: existingMembership.name,
			created: false,
		};
	}

	return await sql.begin(async (tx) => {
		const trimmedName = user.name?.trim();
		const organizationName = trimmedName
			? `${trimmedName}'s Organization`
			: "Organization";

		let slugBase = toSlug(randomName());
		if (!slugBase) {
			slugBase = `org-${Date.now()}`;
		}

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const slug = attempt === 0 ? slugBase : `${slugBase}-${attempt + 1}`;

			try {
				const [organization] = await tx<OrganizationRow[]>`
					insert into organizations ${sql({
						name: organizationName,
						slug,
					})}
					returning *
				`;

				await tx`
					insert into members ${sql({
						organization_id: organization.id,
						user_id: user.id,
						role: OWNER_ROLE,
					})}
				`;

				return {
					id: organization.id,
					name: organization.name,
					created: true,
				};
			} catch (error) {
				const postgresError = error as { code?: string };
				if (postgresError?.code !== "23505" || attempt === MAX_ATTEMPTS - 1) {
					throw error;
				}
			}
		}

		throw new Error("Failed to create organization after multiple attempts.");
	});
}

export async function getActiveOrganizationForUser(
	userId: string,
): Promise<OrganizationMembership> {
	const [existingMembership] = await sql<
		Exclude<OrganizationMembership, undefined>[]
	>`
		select o.id, o.name
		from members m
		inner join organizations o on o.id = m.organization_id
		where m.user_id = ${userId}
		order by m.created_at asc
		limit 1
	`;

	return existingMembership;
}
