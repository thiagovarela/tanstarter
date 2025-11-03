// src/start.ts
import { createMiddleware, createStart } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

const loggingMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const start = Date.now();
		const { method, url } = request;

		logger.info({ method, url }, "Incoming request");

		try {
			const result = await next();
			const duration = Date.now() - start;
			logger.info(
				{ method, url, status: result.response.status, duration },
				"Request completed",
			);
			return result;
		} catch (error) {
			const duration = Date.now() - start;
			logger.error({ method, url, duration, err: error }, "Request failed");
			throw error;
		}
	},
);

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
		requestMiddleware: [sessionMiddleware],
	};
});
