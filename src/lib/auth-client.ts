import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [anonymousClient(), adminClient(), organizationClient()],
});

export type Session = typeof authClient.$Infer.Session;
