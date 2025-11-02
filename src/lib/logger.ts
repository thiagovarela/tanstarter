import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
	level,
});

export type Logger = typeof logger;
