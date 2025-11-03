import { z } from "zod";

const runtimeEnv =
	typeof Bun !== "undefined"
		? Bun.env
		: (process.env as Record<string, string | undefined>);

const envSchema = z
	.object({
		DATABASE_URL: z.url(),
		RESTATE_URL: z.url(),
		GOOGLE_ID_CLIENT_ID: z.string(),
		GOOGLE_ID_CLIENT_SECRET: z.string(),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),
		RESTATE_DEPLOYMENT_URL: z
			.url()
			.optional()
			.default("http://localhost:3000/api/restate/v0"),
		RESTATE_ADMIN_URL: z.url().optional().default("http://localhost:9070"),
	})
	.strip();

const parsed = envSchema.safeParse({
	DATABASE_URL: runtimeEnv.DATABASE_URL,
	RESTATE_URL: runtimeEnv.RESTATE_URL,
	GOOGLE_ID_CLIENT_ID: runtimeEnv.GOOGLE_ID_CLIENT_ID,
	GOOGLE_ID_CLIENT_SECRET: runtimeEnv.GOOGLE_ID_CLIENT_SECRET,
	BETTER_AUTH_SECRET: runtimeEnv.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: runtimeEnv.BETTER_AUTH_URL,
	RESTATE_DEPLOYMENT_URL: runtimeEnv.RESTATE_DEPLOYMENT_URL,
	RESTATE_ADMIN_URL: runtimeEnv.RESTATE_ADMIN_URL,
});

if (!parsed.success) {
	const formatted = z.treeifyError(parsed.error);
	throw new Error(
		`Invalid environment variables:\n${JSON.stringify(formatted, null, 2)}`,
	);
}

export const env = parsed.data;
