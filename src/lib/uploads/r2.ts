import { cloudflare } from "better-upload/server/helpers";

import { env } from "@/lib/env";

export const client = cloudflare({
	accountId: env.R2_ACCOUNT_ID,
	accessKeyId: env.R2_ACCESS_KEY_ID,
	secretAccessKey: env.R2_SECRET_ACCESS_KEY,
});

export function buildPublicObjectUrl(objectKey: string): string {
	const normalizedKey = objectKey.replace(/^\/+/, "");
	return `/${normalizedKey}`;
}
