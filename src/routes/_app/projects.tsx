import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/projects")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_app/projects"!</div>;
}
