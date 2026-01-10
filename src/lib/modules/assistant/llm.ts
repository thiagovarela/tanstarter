import { openai } from "@ai-sdk/openai";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";
import type { GenerateSummaryInput, SummaryOutput } from "./types";

// Model configuration - can be swapped easily
const model = openai("gpt-4o-mini");

const styleInstructions = {
	concise: "Keep the summary under 100 words. Be brief and to the point.",
	detailed:
		"Provide a comprehensive summary with context. Include relevant details.",
	"bullet-points":
		"Format the summary as bullet points. Use clear, actionable items.",
} as const;

/**
 * Generate a structured summary using AI.
 * Returns a typed object with summary, key points, and word count.
 */
export async function generateSummary(
	input: GenerateSummaryInput,
): Promise<SummaryOutput> {
	const style = input.style ?? "concise";

	const { text } = await generateText({
		model,
		system: `You are a helpful assistant that summarizes content.
${styleInstructions[style]}
Return a JSON object with exactly these fields:
- summary: string (the generated summary)
- keyPoints: string[] (3-5 key points extracted)
- wordCount: number (word count of the original content)`,
		prompt: `Summarize the following content and return valid JSON:\n\n${input.content}`,
	});

	// Parse the JSON response
	const parsed = JSON.parse(text) as SummaryOutput;
	return parsed;
}

/**
 * Stream a response with tool calling capabilities.
 * Demonstrates the AI SDK tool pattern.
 */
export async function streamWithTools(prompt: string) {
	return streamText({
		model,
		system:
			"You are a helpful assistant. Use the available tools when appropriate.",
		prompt,
		tools: {
			getCurrentTime: tool({
				description: "Get the current date and time in ISO format",
				inputSchema: z.object({}),
				execute: async () => {
					return new Date().toISOString();
				},
			}),

			calculateSum: tool({
				description: "Calculate the sum of a list of numbers",
				inputSchema: z.object({
					numbers: z.array(z.number()).describe("Numbers to sum together"),
				}),
				execute: async ({ numbers }) => {
					const sum = numbers.reduce((a: number, b: number) => a + b, 0);
					return `The sum is ${sum}`;
				},
			}),

			formatMarkdown: tool({
				description: "Format text as markdown with headers and lists",
				inputSchema: z.object({
					title: z.string().describe("The title for the document"),
					items: z.array(z.string()).describe("Items to list"),
				}),
				execute: async ({ title, items }) => {
					const list = items.map((item: string) => `- ${item}`).join("\n");
					return `# ${title}\n\n${list}`;
				},
			}),
		},
	});
}
