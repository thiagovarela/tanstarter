import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { getOrganizationDetail, updateOrganization } from "./detail-server";
import type {
	OrganizationDetail,
	UpdateOrganizationInput,
} from "./detail-types";

export const organizationDetailQueryKey = (organizationId: string) =>
	["settings", "organizations", organizationId] as const;

export const getOrganizationDetailQueryOptions = (organizationId: string) => ({
	queryKey: organizationDetailQueryKey(organizationId),
	queryFn: async (): Promise<OrganizationDetail> =>
		getOrganizationDetail({ data: { organizationId } }),
});

export function useOrganizationDetailQuery(organizationId: string) {
	return useSuspenseQuery(getOrganizationDetailQueryOptions(organizationId));
}

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
				queryKey: ["settings", "organizations"],
			});
		},
	});
}
