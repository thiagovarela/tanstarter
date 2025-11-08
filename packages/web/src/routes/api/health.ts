import { createFileRoute } from "@tanstack/react-router";

import { db } from "@tanstarter/data";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: async () => {
				await db`SELECT 1`;
				return new Response("Hello, World!");
			},
		},
	},
});
