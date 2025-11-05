import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createAuthServerFn } from "@/lib/auth-server-fn";
import { sql } from "@/lib/db";
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
		logo: organization.logo,
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

async function ensureAdminMembership(userId: string, organizationId: string) {
	const [membership] = await sql<{ role: string }[]>`
		select role
		from members
		where organization_id = ${organizationId} and user_id = ${userId}
	`;

	if (!membership) {
		throw new Error("You do not have access to this organization.");
	}

	if (membership.role !== "owner") {
		throw new Error("You do not have permission to update this organization.");
	}
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
		await ensureAdminMembership(context.user.id, data.organizationId);

		await sql`
			update organizations
			set name = ${data.name}
			where id = ${data.organizationId}
		`;

		return fetchOrganizationDetail(context.user.id, data.organizationId);
	});

export const inviteOrganizationMember = createAuthServerFn({ method: "POST" })
	.inputValidator(inviteOrganizationMemberSchema)
	.handler(async ({ context, data }) => {
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
