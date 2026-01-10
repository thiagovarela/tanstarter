import { sql } from "@/data";

export class AccountManager {
	static async ensureDefaultProject(organizationId: string): Promise<string> {
		const [existingProject] = await sql<{ id: string }[]>`
			SELECT id
			FROM projects
			WHERE organization_id = ${organizationId}
			LIMIT 1
		`;

		if (existingProject) {
			return existingProject.id;
		}

		const [project] = await sql<{ id: string }[]>`
			INSERT INTO projects ${sql({
				name: "Default Project",
				organization_id: organizationId,
			})}
			RETURNING id
		`;

		if (!project) {
			throw new Error("Failed to create default project");
		}

		return project.id;
	}
}
