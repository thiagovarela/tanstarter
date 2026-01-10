import * as restate from "@restatedev/restate-sdk-clients";

import { env } from "./env";

export const restateClient = restate.connect({ url: env.RESTATE_URL });

export { restate };
