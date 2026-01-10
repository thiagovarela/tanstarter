import { sql } from "@/data";
import { buildPublicObjectUrl } from "@/lib/uploads/r2";
import type { Organization, OrganizationDetail } from "./types";

type OrganizationRow = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	createdAt: Date | string;
};

type OrganizationMemberRow = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	role: string;
	createdAt: Date | string;
};

export class OrganizationManager {
	static async listByUser(userId: string): Promise<Organization[]> {
		return sql<Organization[]>`
			SELECT o.id, o.name, o.slug, o.created_at
			FROM organizations o
			INNER JOIN members m ON m.organization_id = o.id
			WHERE m.user_id = ${userId}
			ORDER BY o.created_at DESC
		`;
	}

	static async getDetail(
		userId: string,
		organizationId: string,
	): Promise<OrganizationDetail> {
		const [organization] = await sql<OrganizationRow[]>`
			SELECT o.id, o.name, o.slug, o.logo, o.created_at
			FROM organizations o
			INNER JOIN members m ON m.organization_id = o.id
			WHERE o.id = ${organizationId} AND m.user_id = ${userId}
		`;

		if (!organization) {
			throw new Error("Organization not found.");
		}

		const logoUrl = organization.logo
			? organization.logo.startsWith("http")
				? organization.logo
				: buildPublicObjectUrl(organization.logo)
			: null;

		const members = await sql<OrganizationMemberRow[]>`
			SELECT
				m.id,
				m.role,
				m.created_at,
				u.name,
				u.email,
				u.image
			FROM members m
			INNER JOIN users u ON u.id = m.user_id
			WHERE m.organization_id = ${organizationId}
			ORDER BY m.created_at ASC
		`;

		return {
			id: organization.id,
			name: organization.name,
			slug: organization.slug,
			logo: logoUrl,
			createdAt: new Date(organization.createdAt).toISOString(),
			members: members.map((member) => ({
				id: member.id,
				name: member.name,
				email: member.email,
				role: member.role,
				joinedAt: new Date(member.createdAt).toISOString(),
				mfaEnabled: false,
				avatarUrl: member.image,
			})),
		};
	}

	static async update(
		organizationId: string,
		data: { name: string; logo?: string | null },
	): Promise<void> {
		const updatePayload: { name: string; logo?: string | null } = {
			name: data.name,
		};
		const columns: Array<"name" | "logo"> = ["name"];

		if (data.logo !== undefined) {
			updatePayload.logo = data.logo;
			columns.push("logo");
		}

		await sql`
			UPDATE organizations
			SET ${sql(updatePayload, columns)}
			WHERE id = ${organizationId}
		`;
	}
}
