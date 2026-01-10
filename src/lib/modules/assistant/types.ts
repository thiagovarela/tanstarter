import { z } from "zod";

// Input for generating a summary
export const generateSummaryInput = z.object({
	content: z.string().min(1, "Content is required"),
	style: z.enum(["concise", "detailed", "bullet-points"]).optional(),
});

export type GenerateSummaryInput = z.infer<typeof generateSummaryInput>;

// Structured output schema
export const summaryOutputSchema = z.object({
	summary: z.string().describe("The generated summary"),
	keyPoints: z.array(z.string()).describe("Key points extracted"),
	wordCount: z.number().describe("Original word count"),
});

export type SummaryOutput = z.infer<typeof summaryOutputSchema>;
