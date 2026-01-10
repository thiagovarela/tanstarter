import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getOrganizationDetail,
	inviteOrganizationMember,
	listOrganizations,
	updateOrganization,
} from "./functions";
import type {
	InviteOrganizationMemberInput,
	Organization,
	OrganizationDetail,
	UpdateOrganizationInput,
} from "./types";

const organizationsQueryKey = ["settings", "organizations"] as const;

export const getOrganizationsQueryOptions = () => ({
	queryKey: organizationsQueryKey,
	queryFn: async (): Promise<Organization[]> => listOrganizations(),
});

export const organizationDetailQueryKey = (organizationId: string) =>
	["settings", "organizations", organizationId] as const;

export const getOrganizationDetailQueryOptions = (organizationId: string) => ({
	queryKey: organizationDetailQueryKey(organizationId),
	queryFn: async (): Promise<OrganizationDetail> =>
		getOrganizationDetail({ data: { organizationId } }),
});

export function useUpdateOrganizationMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateOrganizationInput) =>
			updateOrganization({ data: input }),
		onSuccess: (organization) => {
			queryClient.setQueryData(
				organizationDetailQueryKey(organizationId),
				organization,
			);
			void queryClient.invalidateQueries({
				queryKey: organizationsQueryKey,
			});
		},
	});
}

export function useInviteOrganizationMemberMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: InviteOrganizationMemberInput) =>
			inviteOrganizationMember({ data: input }),
		onSuccess: (organization) => {
			queryClient.setQueryData(
				organizationDetailQueryKey(organizationId),
				organization,
			);
			void queryClient.invalidateQueries({
				queryKey: organizationsQueryKey,
			});
		},
	});
}
