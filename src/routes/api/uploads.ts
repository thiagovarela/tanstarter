import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import {
	createUploadRouteHandler,
	RejectUpload,
	route,
} from "better-upload/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { env } from "@/lib/env";
import { buildPublicObjectUrl, client } from "@/lib/uploads/r2";

const clientMetadataSchema = z.object({
	organizationId: z.uuid(),
});

const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

async function ensureOrganizationOwner(userId: string, organizationId: string) {
	const [membership] = await sql<{ role: string }[]>`
		select role
		from members
		where organization_id = ${organizationId} and user_id = ${userId}
	`;

	if (!membership) {
		throw new RejectUpload("You do not have access to this organization.");
	}

	if (membership.role !== "owner") {
		throw new RejectUpload(
			"You do not have permission to update this organization.",
		);
	}
}

function inferExtension(fileName: string, mimeType: string): string {
	const mimeExtension: Record<string, string> = {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/webp": "webp",
	};

	if (mimeExtension[mimeType]) {
		return mimeExtension[mimeType];
	}

	const [, extension] = /.+\.([a-z0-9]+)$/i.exec(fileName) ?? [];
	return extension?.toLowerCase() ?? "png";
}

const organizationLogoRoute = route({
	fileTypes: ALLOWED_FILE_TYPES as unknown as string[],
	maxFileSize: MAX_FILE_SIZE_BYTES,
	onBeforeUpload: async ({ req, file, clientMetadata }) => {
		const session = await auth.api.getSession({ headers: req.headers });

		if (!session) {
			throw new RejectUpload("You must be signed in to upload.");
		}

		const metadata = clientMetadataSchema.parse(clientMetadata);

		await ensureOrganizationOwner(session.user.id, metadata.organizationId);

		const extension = inferExtension(file.name, file.type);
		const objectKey = [
			"organizations",
			metadata.organizationId,
			"logo",
			`${randomUUID()}.${extension}`,
		].join("/");

		return {
			metadata,
			objectInfo: {
				key: objectKey,
				cacheControl: "public, max-age=31536000, immutable",
			},
		};
	},
	onAfterSignedUrl: async ({ metadata, file }) => {
		const parsedMetadata = clientMetadataSchema.parse(metadata);
		const url = buildPublicObjectUrl(file.objectKey);

		return {
			metadata: {
				organizationId: parsedMetadata.organizationId,
				objectKey: file.objectKey,
				url,
				bucket: env.R2_BUCKET_NAME,
			},
		};
	},
});

const router = {
	client,
	bucketName: env.R2_BUCKET_NAME,
	routes: {
		"organization-logo": organizationLogoRoute,
	},
} as const;

const uploadHandler = createUploadRouteHandler(router);

export const Route = createFileRoute("/api/uploads")({
	server: {
		handlers: {
			POST: async ({ request }) => uploadHandler.POST(request),
		},
	},
});
