import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/features/auth/Login";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Login />;
}
