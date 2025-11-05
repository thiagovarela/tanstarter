import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, organizations, projects } from "@/lib/schema";
import type {
	CreateProjectInput,
	ProjectIdInput,
	ProjectQueryInput,
	UpdateProjectInput,
} from "@/lib/schemas/projects";

export type ProjectWithOrg = typeof projects.$inferSelect & {
	organization: typeof organizations.$inferSelect;
};

export async function getProjects(
	userId: string,
	filters: ProjectQueryInput = {},
) {
	const {
		organizationId,
		archived,
		limit = 20,
		offset = 0,
		sort = "updatedAt",
		order = "desc",
	} = filters;

	// Get organizations the user has access to
	const userOrgs = await db
		.select({ organizationId: members.organizationId })
		.from(members)
		.where(eq(members.userId, userId));

	const orgIds = userOrgs.map((org) => org.organizationId);
	if (orgIds.length === 0) {
		return { projects: [], total: 0 };
	}

	// Build the base query
	let query = db
		.select({
			id: projects.id,
			name: projects.name,
			logo: projects.logo,
			organizationId: projects.organizationId,
			archived: projects.archived,
			createdAt: projects.createdAt,
			updatedAt: projects.updatedAt,
			organization: {
				id: organizations.id,
				name: organizations.name,
				logo: organizations.logo,
			},
		})
		.from(projects)
		.innerJoin(organizations, eq(projects.organizationId, organizations.id))
		.where(
			and(
				eq(projects.organizationId, organizationId || orgIds[0]),
				typeof archived === "boolean"
					? eq(projects.archived, archived)
					: undefined,
			),
		)
		.limit(limit)
		.offset(offset);

	// Add sorting
	const sortColumn =
		sort === "name"
			? projects.name
			: sort === "createdAt"
				? projects.createdAt
				: projects.updatedAt;

	query =
		order === "asc"
			? query.orderBy(asc(sortColumn))
			: query.orderBy(desc(sortColumn));

	const projectList = await query;

	// Get total count
	const totalQuery = db
		.select({ count: count() })
		.from(projects)
		.where(
			and(
				eq(projects.organizationId, organizationId || orgIds[0]),
				typeof archived === "boolean"
					? eq(projects.archived, archived)
					: undefined,
			),
		);

	const [{ count: total }] = await totalQuery;

	return { projects: projectList, total };
}

export async function getProject(userId: string, input: ProjectIdInput) {
	const { projectId } = input;

	// Check if user has access to the project's organization
	const memberCheck = await db
		.select({ organizationId: members.organizationId })
		.from(members)
		.where(
			and(
				eq(members.userId, userId),
				eq(
					members.organizationId,
					db
						.select({ organizationId: projects.organizationId })
						.from(projects)
						.where(eq(projects.id, projectId))
						.limit(1),
				),
			),
		)
		.limit(1);

	if (memberCheck.length === 0) {
		return null;
	}

	const project = await db
		.select({
			id: projects.id,
			name: projects.name,
			logo: projects.logo,
			organizationId: projects.organizationId,
			archived: projects.archived,
			createdAt: projects.createdAt,
			updatedAt: projects.updatedAt,
			organization: {
				id: organizations.id,
				name: organizations.name,
				logo: organizations.logo,
			},
		})
		.from(projects)
		.innerJoin(organizations, eq(projects.organizationId, organizations.id))
		.where(eq(projects.id, projectId))
		.limit(1);

	return project[0] || null;
}

export async function createProject(userId: string, input: CreateProjectInput) {
	const { name, description, organizationId, logo } = input;

	// Get user's organizations if no organization specified
	let targetOrgId = organizationId;
	if (!targetOrgId) {
		const userOrg = await db
			.select({ organizationId: members.organizationId })
			.from(members)
			.where(eq(members.userId, userId))
			.limit(1);

		if (userOrg.length === 0) {
			throw new Error("User has no organization access");
		}
		targetOrgId = userOrg[0].organizationId;
	}

	// Verify user is member of the target organization
	const memberCheck = await db
		.select({ id: members.id })
		.from(members)
		.where(
			and(eq(members.userId, userId), eq(members.organizationId, targetOrgId)),
		)
		.limit(1);

	if (memberCheck.length === 0) {
		throw new Error("User is not a member of this organization");
	}

	const [project] = await db
		.insert(projects)
		.values({
			name,
			description,
			logo,
			organizationId: targetOrgId,
		})
		.returning();

	return project;
}

export async function updateProject(
	userId: string,
	projectId: string,
	input: UpdateProjectInput,
) {
	// Check if user has access to the project's organization
	const memberCheck = await db
		.select({ id: members.id })
		.from(members)
		.where(
			and(
				eq(members.userId, userId),
				eq(
					members.organizationId,
					db
						.select({ organizationId: projects.organizationId })
						.from(projects)
						.where(eq(projects.id, projectId))
						.limit(1),
				),
			),
		)
		.limit(1);

	if (memberCheck.length === 0) {
		throw new Error("User does not have access to this project");
	}

	const [project] = await db
		.update(projects)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}

export async function deleteProject(userId: string, projectId: string) {
	// Check if user has access to the project's organization
	const memberCheck = await db
		.select({ id: members.id })
		.from(members)
		.where(
			and(
				eq(members.userId, userId),
				eq(
					members.organizationId,
					db
						.select({ organizationId: projects.organizationId })
						.from(projects)
						.where(eq(projects.id, projectId))
						.limit(1),
				),
			),
		)
		.limit(1);

	if (memberCheck.length === 0) {
		throw new Error("User does not have access to this project");
	}

	const [project] = await db
		.delete(projects)
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}

export async function archiveProject(
	userId: string,
	projectId: string,
	archived: boolean,
) {
	// Check if user has access to the project's organization
	const memberCheck = await db
		.select({ id: members.id })
		.from(members)
		.where(
			and(
				eq(members.userId, userId),
				eq(
					members.organizationId,
					db
						.select({ organizationId: projects.organizationId })
						.from(projects)
						.where(eq(projects.id, projectId))
						.limit(1),
				),
			),
		)
		.limit(1);

	if (memberCheck.length === 0) {
		throw new Error("User does not have access to this project");
	}

	const [project] = await db
		.update(projects)
		.set({
			archived,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}
