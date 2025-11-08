import type { Session } from "@/lib/auth-client";
import { Route as RootRoute } from "@/routes/__root";

export function useSession(): Session {
	const { session } = RootRoute.useRouteContext();
	if (!session) {
		throw new Error("Invalid session");
	}
	return session;
}
