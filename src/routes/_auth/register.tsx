import { createFileRoute } from "@tanstack/react-router";
import { Register } from "@/features/auth/Register";

export const Route = createFileRoute("/_auth/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Register />;
}
