import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import {
	deleteProject,
	listActiveOrganizationProjects,
	updateProject,
} from "./functions";
import type { ProjectListItem } from "./types";

/**
 * Creates a collection for projects that syncs local changes to the server.
 * Use this for real-time optimistic updates with automatic server sync.
 */
export function createProjectCollection(
	organizationId: string,
	queryClient: QueryClient,
) {
	return createCollection(
		queryCollectionOptions({
			id: `projects-${organizationId}`,
			queryKey: ["projects", "list", organizationId],
			queryFn: async (): Promise<ProjectListItem[]> => {
				const result = await listActiveOrganizationProjects();
				return result.projects;
			},
			queryClient,
			getKey: (item) => item.id,

			onUpdate: async ({ transaction }) => {
				const mutation = transaction.mutations[0];
				if (!mutation) return;

				// Filter out null values from changes
				const changes = Object.fromEntries(
					Object.entries(mutation.changes).filter(([_, v]) => v !== null),
				) as Partial<{ name: string; archived: boolean }>;

				await updateProject({
					data: {
						projectId: mutation.key as string,
						...changes,
					},
				});

				// Don't refetch - trust the local state
				return { refetch: false };
			},

			onDelete: async ({ transaction }) => {
				const mutation = transaction.mutations[0];
				if (!mutation) return;

				await deleteProject({
					data: {
						projectId: mutation.key as string,
					},
				});

				return { refetch: false };
			},
		}),
	);
}

export type ProjectCollection = ReturnType<typeof createProjectCollection>;
