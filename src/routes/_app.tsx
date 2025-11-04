import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Shell } from "@/components/shell/Shell";
import { AuthProvider } from "@/integrations/better-auth/auth-provider";

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
	const session = Route.useRouteContext();
	return (
		<AuthProvider session={session}>
			<Shell>
				<Outlet />
			</Shell>
		</AuthProvider>
	);
}
