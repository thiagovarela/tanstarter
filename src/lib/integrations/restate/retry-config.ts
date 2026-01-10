/**
 * Retry configuration for external API calls (LLMs, external services, etc.)
 * - 5 attempts total (initial + 4 retries)
 * - Exponential backoff: 1s -> 2s -> 4s -> 8s -> 16s (capped at 30s)
 * - After exhausting retries, throws TerminalError
 */
export const externalApiRetryOptions = {
	maxRetryAttempts: 5,
	initialRetryInterval: 1000, // 1 second
	maxRetryInterval: 30000, // 30 seconds
	retryIntervalFactor: 2, // exponential backoff
} as const;
