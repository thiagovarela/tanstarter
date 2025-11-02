import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	RESTATE_URL: z.string().min(1, "RESTATE_URL is required"),
	GOOGLE_ID_CLIENT_ID: z.string().min(1, "GOOGLE_ID_CLIENT_ID is required"),
	GOOGLE_ID_CLIENT_SECRET: z
		.string()
		.min(1, "GOOGLE_ID_CLIENT_SECRET is required"),
	BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
	BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
	const formatted = parsed.error.format();
	throw new Error(
		`Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`,
	);
}

export const env = parsed.data;
