import * as restate from "@restatedev/restate-sdk";
import { serde } from "@restatedev/restate-sdk-zod";
import { z } from "zod";
import { externalApiRetryOptions } from "@/lib/integrations/restate/retry-config";
import { generateSummary } from "./llm";
import { generateSummaryInput, summaryOutputSchema } from "./types";

/**
 * Durable workflow for LLM operations.
 * Provides fault-tolerance for long-running or expensive LLM calls.
 */
export const assistant = restate.service({
	name: "Assistant",
	handlers: {
		/**
		 * Generate a summary with durable execution.
		 * - Retries on transient failures (rate limits, timeouts)
		 * - Survives service restarts
		 * - Exactly-once execution guarantee
		 */
		summarize: restate.createServiceHandler(
			{
				input: serde.zod(generateSummaryInput),
				output: serde.zod(summaryOutputSchema),
			},
			async (ctx: restate.Context, input) => {
				const taskId = ctx.rand.uuidv4();

				// Step 1: Log start (durable)
				await ctx.run("logStart", () => {
					console.log(`[${taskId}] Starting summary generation`);
				});

				// Step 2: Generate summary with retry on failure
				const result = await ctx.run(
					"generateSummary",
					() => generateSummary(input),
					externalApiRetryOptions,
				);

				// Step 3: Log completion (durable)
				await ctx.run("logComplete", () => {
					console.log(
						`[${taskId}] Summary generated: ${result.wordCount} words`,
					);
				});

				return result;
			},
		),

		/**
		 * Batch process multiple summaries in parallel.
		 * Each summary is processed with its own retry logic.
		 */
		batchSummarize: restate.createServiceHandler(
			{
				input: serde.zod(z.array(generateSummaryInput)),
				output: serde.zod(z.array(summaryOutputSchema)),
			},
			async (ctx: restate.Context, inputs) => {
				// Process all inputs in parallel with Restate
				const promises = inputs.map((input, i) =>
					ctx.run(
						`summary-${i}`,
						() => generateSummary(input),
						externalApiRetryOptions,
					),
				);

				const results = await restate.RestatePromise.allSettled(promises);

				// Return only successful results
				const successfulResults: Array<{
					summary: string;
					keyPoints: string[];
					wordCount: number;
				}> = [];

				for (const result of results) {
					if (result.status === "fulfilled") {
						successfulResults.push(result.value);
					}
				}

				return successfulResults;
			},
		),
	},
});

export type AssistantService = typeof assistant;
export const Assistant: AssistantService = { name: "Assistant" };
