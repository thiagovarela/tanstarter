import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/db";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				await db`SELECT 1`;
				return new Response("Hello, World!");
			},
		},
	},
});
