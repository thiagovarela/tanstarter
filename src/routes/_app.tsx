import { createFileRoute, Outlet } from "@tanstack/react-router";
import Shell from "@/features/shell/Shell";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Shell>
			<Outlet />
		</Shell>
	);
}
