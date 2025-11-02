import { z } from "zod";

const envSchema = z
	.object({
		DATABASE_URL: z.url(),
		RESTATE_URL: z.url(),
		GOOGLE_ID_CLIENT_ID: z.string(),
		GOOGLE_ID_CLIENT_SECRET: z.string(),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.string(),
		RESTATE_DEPLOYMENT_URL: z
			.url("RESTATE_DEPLOYMENT_URL must be a valid URL")
			.optional()
			.default("http://localhost:3000/api/restate/v0"),
		RESTATE_ADMIN_URL: z
			.url("RESTATE_ADMIN_URL must be a valid URL")
			.optional()
			.default("http://localhost:9070"),
	})
	.strip();

const parsed = envSchema.safeParse({
	DATABASE_URL: Bun.env.DATABASE_URL,
	RESTATE_URL: Bun.env.RESTATE_URL,
	GOOGLE_ID_CLIENT_ID: Bun.env.GOOGLE_ID_CLIENT_ID,
	GOOGLE_ID_CLIENT_SECRET: Bun.env.GOOGLE_ID_CLIENT_SECRET,
	BETTER_AUTH_SECRET: Bun.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: Bun.env.BETTER_AUTH_URL,
	RESTATE_DEPLOYMENT_URL: Bun.env.RESTATE_DEPLOYMENT_URL,
	RESTATE_ADMIN_URL: Bun.env.RESTATE_ADMIN_URL,
});

if (!parsed.success) {
	const formatted = z.treeifyError(parsed.error);
	throw new Error(
		`Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`,
	);
}

export const env = parsed.data;
