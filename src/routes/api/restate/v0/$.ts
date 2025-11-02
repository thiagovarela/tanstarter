import { createFileRoute } from "@tanstack/react-router";
import * as restate from "@restatedev/restate-sdk/fetch";

import { accounts } from "@/lib/workflows";

const endpoint = restate.createEndpointHandler({
	services: [accounts],
});

export const Route = createFileRoute("/api/restate/v0/$")({
	server: {
		handlers: {
			GET: ({ request }) => {
				return endpoint(request);
			},
			POST: ({ request }) => {
				return endpoint(request);
			},
		},
	},
});
