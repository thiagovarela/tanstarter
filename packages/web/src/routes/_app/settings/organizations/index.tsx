import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import { useShellBreadcrumbs } from "@/components/shell/shell-breadcrumb-context";
import { getOrganizationsQueryOptions } from "./-components/queries";
import { OrganizationsView } from "./-components/view";

export const Route = createFileRoute("/_app/settings/organizations/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getOrganizationsQueryOptions());
	},
	component: OrganizationsRouteComponent,
});

function OrganizationsRouteComponent() {
	const breadcrumbs = useMemo(() => [{ label: "Organizations" }], []);
	useShellBreadcrumbs(breadcrumbs);

	return (
		<Suspense fallback={<div>Loading organizations...</div>}>
			<OrganizationsView />
		</Suspense>
	);
}
