import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
	level,
});

// Restate logger transport that integrates with pino
export const restateLoggerTransport = (
	meta: { level: string; context?: { invocationId?: string } },
	message?: any,
	...optionalParams: any[]
) => {
	const logData: any = {};

	if (meta.context?.invocationId) {
		logData.invocationId = meta.context.invocationId;
	}

	const logMessage = [message, ...optionalParams].join(" ");

	// Map Restate log levels to pino levels
	switch (meta.level.toLowerCase()) {
		case "trace":
		case "debug":
			logger.debug(logData, logMessage);
			break;
		case "info":
			logger.info(logData, logMessage);
			break;
		case "warn":
			logger.warn(logData, logMessage);
			break;
		case "error":
			logger.error(logData, logMessage);
			break;
		default:
			logger.info(logData, logMessage);
			break;
	}
};

export type Logger = typeof logger;
