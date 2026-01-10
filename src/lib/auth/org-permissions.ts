import type { AuthorizeResponse } from "better-auth/plugins/access";
import { sql } from "@/data";
import type { OrganizationPermissionStatements } from "@/lib/auth/permissions";
import { roles } from "@/lib/auth/permissions";

type PermissionResource = keyof OrganizationPermissionStatements;
type PermissionActions<Resource extends PermissionResource> =
	OrganizationPermissionStatements[Resource][number];

export type PermissionRequest = Partial<{
	[Resource in PermissionResource]?:
		| PermissionActions<Resource>
		| PermissionActions<Resource>[];
}>;

export type OrganizationMembership = {
	role: string;
};

export class AuthorizationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthorizationError";
	}
}

const ROLE_SEPARATOR = ",";

export function listMembershipRoles(roleString: string | null | undefined) {
	if (!roleString) {
		return [];
	}

	return roleString
		.split(ROLE_SEPARATOR)
		.map((role) => role.trim().toLowerCase())
		.filter(Boolean);
}

function toAuthorizePayload(permissions: PermissionRequest) {
	const payload: Record<string, string[]> = {};

	for (const [resource, value] of Object.entries(permissions)) {
		if (!value) {
			continue;
		}

		payload[resource] = Array.isArray(value) ? value : [value];
	}

	return payload;
}

export function authorizeRoles({
	roleNames,
	permissions,
	connector,
}: {
	roleNames: string[];
	permissions: PermissionRequest;
	connector: "AND" | "OR";
}) {
	const authorizePayload = toAuthorizePayload(permissions);

	return roleNames.some((roleName) => {
		const role = roles[roleName as keyof typeof roles];
		if (!role) {
			return false;
		}

		const result: AuthorizeResponse = role.authorize(
			authorizePayload,
			connector,
		);
		return result.success;
	});
}

export async function getOrganizationMembership({
	userId,
	organizationId,
}: {
	userId: string;
	organizationId: string;
}) {
	const [membership] = await sql<OrganizationMembership[]>`
		select role
		from members
		where organization_id = ${organizationId} and user_id = ${userId}
		limit 1
	`;

	return membership ?? null;
}

export async function hasOrgPermission({
	userId,
	organizationId,
	permissions,
	connector = "AND",
}: {
	userId: string;
	organizationId: string;
	permissions: PermissionRequest;
	connector?: "AND" | "OR";
}) {
	const membership = await getOrganizationMembership({
		userId,
		organizationId,
	});
	if (!membership) {
		return {
			allowed: false,
			roleNames: [],
		};
	}

	const roleNames = listMembershipRoles(membership.role);

	if (roleNames.length === 0) {
		return {
			allowed: false,
			roleNames: [],
		};
	}

	return {
		allowed: authorizeRoles({ roleNames, permissions, connector }),
		roleNames,
	};
}

export async function requireOrgPermission(options: {
	userId: string;
	organizationId: string;
	permissions: PermissionRequest;
	connector?: "AND" | "OR";
	errorMessage?: string;
}) {
	const { userId, organizationId, permissions, connector, errorMessage } =
		options;

	const result = await hasOrgPermission({
		userId,
		organizationId,
		permissions,
		connector,
	});

	if (!result.allowed) {
		throw new AuthorizationError(
			errorMessage ??
				"You do not have permission to perform this action for the organization.",
		);
	}

	return result;
}
