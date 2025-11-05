import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Login } from "./-components/Login";

const searchSchema = z.object({
	invitationId: z.uuid().optional(),
});

export const Route = createFileRoute("/_auth/login")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const invitationId = Route.useSearch({
		select: (search) => search?.invitationId,
	});
	return <Login invitationId={invitationId} />;
}
