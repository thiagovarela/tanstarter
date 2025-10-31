import { createFileRoute } from "@tanstack/react-router";
import * as restate from "@restatedev/restate-sdk/fetch";

import { greeter } from "@/restate";

const endpoint = restate.createEndpointHandler({ services: [greeter] });

export const Route = createFileRoute("/restate/$")({
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
