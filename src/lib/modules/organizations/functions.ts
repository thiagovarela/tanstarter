import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { requireOrgPermission } from "@/lib/auth/org-permissions";
import { createAuthServerFn } from "@/lib/auth-server-fn";
import { requireOrgUserMiddleware } from "@/lib/middleware";
import { OrganizationManager } from "./managers";
import {
	getOrganizationSchema,
	inviteOrganizationMemberSchema,
	type Organization,
	type OrganizationDetail,
	updateOrganizationSchema,
} from "./types";

export const listOrganizations = createAuthServerFn().handler(
	async ({ context }): Promise<Organization[]> => {
		return OrganizationManager.listByUser(context.user.id);
	},
);

export const getOrganizationDetail = createAuthServerFn()
	.inputValidator(getOrganizationSchema)
	.handler(async ({ context, data }): Promise<OrganizationDetail> => {
		return OrganizationManager.getDetail(context.user.id, data.organizationId);
	});

export const updateOrganization = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(updateOrganizationSchema)
	.handler(async ({ context, data }): Promise<OrganizationDetail> => {
		await requireOrgPermission({
			userId: context.user.id,
			organizationId: data.organizationId,
			permissions: {
				organization: "update",
			},
			errorMessage: "You do not have permission to update this organization.",
		});

		await OrganizationManager.update(data.organizationId, {
			name: data.name,
			logo: data.logo,
		});

		return OrganizationManager.getDetail(context.user.id, data.organizationId);
	});

export const inviteOrganizationMember = createAuthServerFn({ method: "POST" })
	.middleware([requireOrgUserMiddleware])
	.inputValidator(inviteOrganizationMemberSchema)
	.handler(async ({ context, data }): Promise<OrganizationDetail> => {
		await requireOrgPermission({
			userId: context.user.id,
			organizationId: data.organizationId,
			permissions: {
				invitation: "create",
			},
			errorMessage: "You do not have permission to invite members.",
		});

		// Verify user has access to the organization
		await OrganizationManager.getDetail(context.user.id, data.organizationId);

		const request = getRequest();

		await auth.api.createInvitation({
			headers: request.headers,
			body: {
				email: data.email,
				role: data.role,
				organizationId: data.organizationId,
			},
		});

		return OrganizationManager.getDetail(context.user.id, data.organizationId);
	});
