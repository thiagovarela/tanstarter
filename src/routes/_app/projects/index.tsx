import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { useShellBreadcrumbs } from "@/components/shell/shell-breadcrumb-context";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/integrations/better-auth/auth-provider";
import { ProjectCreateDialog } from "./-components/project-create-dialog";
import { ProjectsTable } from "./-components/projects-table";
import {
	getProjectsQueryOptions,
	useProjectsQuery,
} from "./-components/queries";

export const Route = createFileRoute("/_app/projects/")({
	loader: async ({ context }) => {
		const organizationId = context.session?.activeOrganizationId;
		if (organizationId) {
			await context.queryClient.ensureQueryData(
				getProjectsQueryOptions(organizationId),
			);
		}
	},
	component: ProjectsRouteComponent,
});

function ProjectsRouteComponent() {
	const breadcrumbs = useMemo(() => [{ label: "Projects" }], []);
	useShellBreadcrumbs(breadcrumbs);
	const { activeOrganizationId } = useAuth();
	const disableCreate = !activeOrganizationId;
	const [createOpen, setCreateOpen] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">
								Projects
							</h1>
							<p className="text-muted-foreground">
								Review everything your team is currently building.
							</p>
						</div>
						<Button
							size="sm"
							disabled={disableCreate}
							onClick={() => {
								if (disableCreate) {
									return;
								}
								setCreateOpen(true);
							}}
						>
							New Project
						</Button>
					</div>
				</div>
			</div>

			{activeOrganizationId ? (
				<>
					<Suspense fallback={<ProjectsLoadingPlaceholder />}>
						<ProjectsList organizationId={activeOrganizationId} />
					</Suspense>
					<ProjectCreateDialog
						organizationId={activeOrganizationId}
						open={createOpen}
						onOpenChange={setCreateOpen}
					/>
				</>
			) : (
				<NoActiveOrganizationMessage />
			)}
		</div>
	);
}

function ProjectsList({ organizationId }: { organizationId: string }) {
	const { data } = useProjectsQuery(organizationId);
	return (
		<ProjectsTable
			projects={data.projects}
			emptyMessage="No projects in this organization yet."
		/>
	);
}

function ProjectsLoadingPlaceholder() {
	return (
		<div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
			Loading projects...
		</div>
	);
}

function NoActiveOrganizationMessage() {
	return (
		<div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
			Select an organization to view its projects.
		</div>
	);
}
