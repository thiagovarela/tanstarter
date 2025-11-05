import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import {
	getOrganizationMembership,
	listMembershipRoles,
} from "@/lib/auth/org-permissions";

export const sessionMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });

		let sessionWithRoles = session;

		if (session && session.session.activeOrganizationId && session.user?.id) {
			const membership = await getOrganizationMembership({
				userId: session.user.id,
				organizationId: session.session.activeOrganizationId,
			});

			const activeOrganizationRoles = listMembershipRoles(
				membership?.role ?? null,
			);

			sessionWithRoles = {
				...session,
				session: {
					...session.session,
					activeOrganizationRole: activeOrganizationRoles[0] ?? null,
					activeOrganizationRoles,
				},
			} as typeof session;
		}

		return next({
			context: {
				session: sessionWithRoles,
			},
		});
	},
);

export const requireSessionMiddleware = createMiddleware({
	type: "function",
})
	.middleware([sessionMiddleware])
	.server(async ({ context, next }) => {
		if (!context?.session) {
			throw redirect({ to: "/login" });
		}

		const session = context.session;

		return next({
			context: {
				session,
				user: session.user,
			},
		});
	});
