// src/start.ts
import { createMiddleware, createStart } from "@tanstack/react-start";
import { logger } from "@/lib/logger";
import { sessionMiddleware } from "@/lib/middleware";

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

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [loggingMiddleware, sessionMiddleware],
	};
});
