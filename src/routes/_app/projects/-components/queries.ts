import { useSuspenseQuery } from "@tanstack/react-query";
import type { ProjectListResponse } from "./server";
import { listActiveOrganizationProjects } from "./server";

const projectsQueryKey = (organizationId: string) =>
	["projects", "list", organizationId] as const;

export const getProjectsQueryOptions = (organizationId: string) => ({
	queryKey: projectsQueryKey(organizationId),
	queryFn: async (): Promise<ProjectListResponse> =>
		listActiveOrganizationProjects(),
});

export function useProjectsQuery(organizationId: string) {
	return useSuspenseQuery(getProjectsQueryOptions(organizationId));
}
