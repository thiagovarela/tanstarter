import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "@/lib/auth";

export const sessionMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		console.log(request.url);
		const session = await auth.api.getSession({ headers: request.headers });

		return next({
			context: { session },
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
