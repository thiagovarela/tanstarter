import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import { createProjectCollection, type ProjectCollection } from "./collection";

const ProjectCollectionContext = createContext<ProjectCollection | null>(null);

type Props = {
	organizationId: string;
	children: ReactNode;
};

/**
 * Provider for the project collection. Wrap your route/component with this
 * to enable real-time optimistic updates with automatic server sync.
 */
export function ProjectCollectionProvider({ organizationId, children }: Props) {
	const queryClient = useQueryClient();
	// React Compiler handles memoization automatically
	const collection = createProjectCollection(organizationId, queryClient);

	return (
		<ProjectCollectionContext.Provider value={collection}>
			{children}
		</ProjectCollectionContext.Provider>
	);
}

/**
 * Hook to access the project collection for optimistic updates.
 * Must be used within a ProjectCollectionProvider.
 */
export function useProjectCollection(): ProjectCollection {
	const collection = useContext(ProjectCollectionContext);
	if (!collection) {
		throw new Error(
			"useProjectCollection must be used within ProjectCollectionProvider",
		);
	}
	return collection;
}
