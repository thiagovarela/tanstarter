import { sql } from "@/data";
import type { CreateProjectInput, ProjectListItem } from "./types";

export class ProjectManager {
	static async list(
		userId: string,
		organizationId: string,
	): Promise<ProjectListItem[]> {
		return sql<ProjectListItem[]>`
			SELECT
				p.id,
				p.name,
				p.logo,
				p.archived,
				p.created_at,
				p.updated_at,
				p.organization_id
			FROM projects p
			INNER JOIN organizations o ON o.id = p.organization_id
			INNER JOIN members m ON m.organization_id = p.organization_id
			WHERE m.user_id = ${userId}
			AND p.organization_id = ${organizationId}
			ORDER BY p.updated_at DESC
		`;
	}

	static async create(
		organizationId: string,
		input: CreateProjectInput,
	): Promise<{
		id: string;
		name: string;
		logo: string | null;
		archived: boolean;
		createdAt: Date;
		updatedAt: Date;
	}> {
		const [project] = await sql`
			INSERT INTO projects (name, organization_id)
			VALUES (${input.name.trim()}, ${organizationId})
			RETURNING id, name, logo, archived, created_at, updated_at
		`;

		if (!project) {
			throw new Error("Failed to create project.");
		}

		return project as {
			id: string;
			name: string;
			logo: string | null;
			archived: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
	}

	static async update(
		projectId: string,
		organizationId: string,
		changes: Partial<{ name: string; archived: boolean }>,
	): Promise<ProjectListItem | null> {
		// Build update object for postgres.js
		const updateData: Record<string, string | boolean> = {};

		if (changes.name !== undefined) {
			updateData.name = changes.name;
		}
		if (changes.archived !== undefined) {
			updateData.archived = changes.archived;
		}

		if (Object.keys(updateData).length === 0) {
			return null;
		}

		const [project] = await sql<ProjectListItem[]>`
			UPDATE projects
			SET ${sql(updateData)}, updated_at = now()
			WHERE id = ${projectId}
			AND organization_id = ${organizationId}
			RETURNING id, name, logo, archived, created_at, updated_at, organization_id
		`;

		return project ?? null;
	}

	static async delete(
		projectId: string,
		organizationId: string,
	): Promise<boolean> {
		const result = await sql`
			DELETE FROM projects
			WHERE id = ${projectId}
			AND organization_id = ${organizationId}
		`;

		return result.count > 0;
	}
}
