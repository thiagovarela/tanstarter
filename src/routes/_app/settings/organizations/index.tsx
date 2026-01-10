import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useShellBreadcrumbs } from "@/components/shell/shell-breadcrumb-context";
import { getOrganizationsQueryOptions } from "@/lib/modules/organizations/queries";
import { OrganizationsView } from "./-components/view";

export const Route = createFileRoute("/_app/settings/organizations/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getOrganizationsQueryOptions());
	},
	component: OrganizationsRouteComponent,
});

const breadcrumbs = [{ label: "Organizations" }];

function OrganizationsRouteComponent() {
	useShellBreadcrumbs(breadcrumbs);

	return (
		<Suspense fallback={<div>Loading organizations...</div>}>
			<OrganizationsView />
		</Suspense>
	);
}
