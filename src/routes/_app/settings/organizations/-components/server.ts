import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireOrgPermission } from "@/lib/auth/org-permissions";
import { createAuthServerFn } from "@/lib/auth-server-fn";
import { sql } from "@/lib/db";
import { buildPublicObjectUrl } from "@/lib/uploads/r2";
import {
	inviteOrganizationMemberSchema,
	updateOrganizationSchema,
} from "./detail-schema";
import type { Organization, OrganizationDetail } from "./types";

const getOrganizationSchema = z.object({
	organizationId: z.uuid(),
});

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

async function fetchOrganizationDetail(
	userId: string,
	organizationId: string,
): Promise<OrganizationDetail> {
	const [organization] = await sql<OrganizationRow[]>`
		select o.id, o.name, o.slug, o.logo, o.created_at
		from organizations o
		inner join members m on m.organization_id = o.id
		where o.id = ${organizationId} and m.user_id = ${userId}
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
		select
			m.id,
			m.role,
			m.created_at,
			u.name,
			u.email,
			u.image
		from members m
		inner join users u on u.id = m.user_id
		where m.organization_id = ${organizationId}
		order by m.created_at asc
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

export const getOrganizationDetail = createAuthServerFn()
	.inputValidator(getOrganizationSchema)
	.handler(async ({ context, data }) => {
		return fetchOrganizationDetail(context.user.id, data.organizationId);
	});

export const updateOrganization = createAuthServerFn({ method: "POST" })
	.inputValidator(updateOrganizationSchema)
	.handler(async ({ context, data }) => {
		await requireOrgPermission({
			userId: context.user.id,
			organizationId: data.organizationId,
			permissions: {
				organization: "update",
			},
			errorMessage: "You do not have permission to update this organization.",
		});

		const updatePayload: {
			name: string;
			logo?: string | null;
		} = {
			name: data.name,
		};
		const columns: Array<"name" | "logo"> = ["name"];

		if (data.logo !== undefined) {
			updatePayload.logo = data.logo;
			columns.push("logo");
		}

		await sql`
			update organizations
			set ${sql(updatePayload, columns)}
			where id = ${data.organizationId}
		`;

		return fetchOrganizationDetail(context.user.id, data.organizationId);
	});

export const inviteOrganizationMember = createAuthServerFn({ method: "POST" })
	.inputValidator(inviteOrganizationMemberSchema)
	.handler(async ({ context, data }) => {
		await requireOrgPermission({
			userId: context.user.id,
			organizationId: data.organizationId,
			permissions: {
				invitation: "create",
			},
			errorMessage: "You do not have permission to invite members.",
		});

		await fetchOrganizationDetail(context.user.id, data.organizationId);

		const request = getRequest();

		await auth.api.createInvitation({
			headers: request.headers,
			body: {
				email: data.email,
				role: data.role,
				organizationId: data.organizationId,
			},
		});

		return fetchOrganizationDetail(context.user.id, data.organizationId);
	});
