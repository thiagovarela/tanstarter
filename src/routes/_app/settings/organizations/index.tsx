import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { getOrganizationsQueryOptions } from "./-components/queries";
import { OrganizationsView } from "./-components/view";

export const Route = createFileRoute("/_app/settings/organizations/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getOrganizationsQueryOptions());
	},
	component: OrganizationsRouteComponent,
});

function OrganizationsRouteComponent() {
	return (
		<Suspense fallback={<div>Loading organizations...</div>}>
			<OrganizationsView />
		</Suspense>
	);
}
