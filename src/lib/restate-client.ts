import * as restate from "@restatedev/restate-sdk-clients";

export const restateClient = restate.connect({ url: Bun.env.RESTATE_URL! });
