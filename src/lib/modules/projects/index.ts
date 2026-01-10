// Server functions (client-callable)

// TanStack DB collections
export { createProjectCollection, type ProjectCollection } from "./collection";
export {
	ProjectCollectionProvider,
	useProjectCollection,
} from "./collection-context";
export {
	createProject,
	deleteProject,
	listActiveOrganizationProjects,
	updateProject,
} from "./functions";
// Query options and mutations
export {
	getProjectsQueryOptions,
	projectsQueryKey,
	useCreateProjectMutation,
} from "./queries";

// Types
export type {
	CreateProjectInput,
	CreateProjectResponse,
	DeleteProjectInput,
	ProjectListItem,
	ProjectListResponse,
	UpdateProjectInput,
} from "./types";
