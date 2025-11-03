import { useSuspenseQuery } from "@tanstack/react-query";
import { listOrganizations } from "./server";
import type { Organization } from "./types";

const organizationsQueryKey = ["settings", "organizations"] as const;

export const getOrganizationsQueryOptions = () => ({
	queryKey: organizationsQueryKey,
	queryFn: async (): Promise<Organization[]> => listOrganizations(),
});

export function useOrganizationsQuery() {
	return useSuspenseQuery(getOrganizationsQueryOptions());
}
