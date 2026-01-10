import {
	adminClient,
	anonymousClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "@/lib/auth/permissions";

export const authClient = createAuthClient({
	plugins: [
		anonymousClient(),
		adminClient(),
		organizationClient({
			ac,
			roles,
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;
