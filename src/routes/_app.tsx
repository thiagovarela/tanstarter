import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Shell } from "@/components/shell/Shell";

export const Route = createFileRoute("/_app")({
	beforeLoad: ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/login" });
		}
		return context.session;
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Shell>
			<Outlet />
		</Shell>
	);
}
