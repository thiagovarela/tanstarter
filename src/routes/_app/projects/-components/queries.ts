import { useSuspenseQuery } from "@tanstack/react-query";
import { useToastMutation } from "@/integrations/tanstack-query/mutation";
import type { ProjectListResponse } from "./server";
import { createProject, listActiveOrganizationProjects } from "./server";

export const projectsQueryKey = (organizationId: string) =>
	["projects", "list", organizationId] as const;

export const getProjectsQueryOptions = (organizationId: string) => ({
	queryKey: projectsQueryKey(organizationId),
	queryFn: async (): Promise<ProjectListResponse> =>
		listActiveOrganizationProjects(),
});

export function useProjectsQuery(organizationId: string) {
	return useSuspenseQuery(getProjectsQueryOptions(organizationId));
}

export function useCreateProjectMutation(organizationId: string) {
	return useToastMutation<
		{ name: string },
		{ project: { id: string; name: string } }
	>({
		mutationFn: async (input) => createProject({ data: input }),
		successMessage: (data) => `Project "${data.project.name}" created`,
		errorMessage: "Failed to create project",
		invalidateKeys: [projectsQueryKey(organizationId)],
	});
}
