import { createServerFn } from "@tanstack/react-start";
import { generateSummary } from "./llm";
import { generateSummaryInput } from "./types";

/**
 * Server function to generate a structured summary.
 * Can be called from client components.
 */
export const summarizeContent = createServerFn({ method: "POST" })
	.inputValidator(generateSummaryInput)
	.handler(async ({ data }) => {
		return generateSummary(data);
	});
