import { createAccessControl } from "better-auth/plugins/access";

const statements = {
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
	project: ["create", "update", "archive", "delete"],
} as const;

export const ac = createAccessControl(statements);

export const member = ac.newRole({
	project: ["create"],
});

export const admin = ac.newRole({
	project: ["create", "update", "archive"],
	organization: ["update"],
	member: ["create", "update"],
	invitation: ["create", "cancel"],
});

export const owner = ac.newRole({
	project: ["create", "update", "archive", "delete"],
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
});

export const roles = {
	owner,
	admin,
	member,
};

export type OrganizationRoleName = keyof typeof roles;
export type OrganizationPermissionStatements = typeof statements;
