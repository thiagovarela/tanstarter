import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Register } from "./-components/Register";

const searchSchema = z.object({
	invitationId: z.uuid().optional(),
});

export const Route = createFileRoute("/_auth/register")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const invitationId = Route.useSearch({
		// Handle missing search by returning undefined
		select: (search) => search?.invitationId,
	});
	return <Register invitationId={invitationId} />;
}
