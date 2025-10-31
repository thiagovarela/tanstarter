// src/start.ts
import { createStart, createMiddleware } from "@tanstack/react-start";
import { auth } from "@/lib/auth";

const loggingMiddleware = createMiddleware().server(async ({ next }) => {
	return next();
});

const sessionMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });

		return next({
			context: { session },
		});
	},
);

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [loggingMiddleware, sessionMiddleware],
	};
});
