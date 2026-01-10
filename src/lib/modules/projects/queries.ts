import { useToastMutation } from "@/integrations/tanstack-query/mutation";
import { createProject, listActiveOrganizationProjects } from "./functions";
import type {
	CreateProjectInput,
	CreateProjectResponse,
	ProjectListResponse,
} from "./types";

export const projectsQueryKey = (organizationId: string) =>
	["projects", "list", organizationId] as const;

export const getProjectsQueryOptions = (organizationId: string) => ({
	queryKey: projectsQueryKey(organizationId),
	queryFn: async (): Promise<ProjectListResponse> =>
		listActiveOrganizationProjects(),
});

export function useCreateProjectMutation(organizationId: string) {
	return useToastMutation<CreateProjectInput, CreateProjectResponse>({
		mutationFn: async (input) => createProject({ data: input }),
		successMessage: (data) => `Project "${data.project.name}" created`,
		errorMessage: "Failed to create project",
		invalidateKeys: [projectsQueryKey(organizationId)],
	});
}
