The year is 2025.

# Tanstarter Agent Guidelines

## Goal
your task is to help the user write clean, simple, readable, modular, well-documented code.
do exactly what the user asks for, nothing more, nothing less.
think hard, like a senior software engineer would.

## About
this codebase is a base for a SaaS application with limited resources and only one software engineer
we CANNOT overthink & over-engineer shit. we have to look for the 80/20 solution.

## Operating
Prioritize simplicity and minimalism in your solutions.
Use simple & easy-to-understand language. Write in short sentences.

## Core Standards
"Should work" != "does work" - Pattern matching is not enough.
I'm not paid to write code, but to solve problems.
Untested code is just a guess, not a solution.

## Phrases to avoid
"This should work now"
"I've fixed the issue" (specially second time)
"Try it now" without trying myself
"The logic is correct so..."

## Start with a prototype
This is a very important concept you must understand when adding new features, always start by creating the prototype first.
This is the 80/20 approach taken to its zenith

## Simplicity
Always prioritize writing clean, simple, and modular code. Do not add unnecessary complications. SIMPLE = GOOD, COMPLEX = BAD.
Implement precisely what the user asks for, without additional features or complexity.

the fewer lines of code, the better.

## Help the user learn

When coding, always explain what you are doing and why your job is to help the user learn & upskill himself, above all assume the user is an intelligent, tech savvy person -- but do not assume he knows the details explain everything clearly, simply, in easy-to-understand language. Write in short sentences.

## Planning

- **Plan**: Use the folder .local-plans with markdown files for ideation, research and planning.

## Commands
- **Build**: `bun run build`
- **Dev**: `bun run dev` (port 3000)
- **Test**: `bun run test` (single test: `bunx vitest run <test-file>`)
- **Lint**: `bun run lint`
- **Format**: `bun run format`
- **Check**: `bun run check` (lint + format)
- **DB**: `bun run db:generate|migrate|push|pull|studio`

## Code Style
- **Formatter**: Biome with tab indentation, double quotes, auto-organize imports
- **TypeScript**: Strict mode, no unused locals/parameters, `@/*` path aliases
- **Components**: shadcn/ui patterns with cva variants, PascalCase naming
- **Forms**: TanStack Form with Zod validation, proper error handling
- **Async**: TanStack Query for data fetching, toast notifications for feedback
- **File structure**:
  - `src/routes/` (feature-based) with `-components/` for UI only
  - `src/lib/modules/` (business logic modules)
  - `src/components/ui/` (core UI components)
  - `src/data/` (database schemas)
- **Styling**: Tailwind CSS with class-variance-authority, cn() utility for classes
- **Workflows**: Restate services in module `durable.ts` files with durable execution, Zod validation

## Modules Pattern

Business logic lives in `src/lib/modules/{feature}/` with standardized files:

```
src/lib/modules/{feature}/
├── types.ts        # Zod schemas & TypeScript types
├── functions.ts    # TanStack Server functions (API layer)
├── managers.ts     # Static class for database operations
├── queries.ts      # TanStack Query options & mutations
└── durable.ts      # Restate services (optional, for workflows)
```

**Example - Projects module:**

```typescript
// types.ts - Input/output contracts
export const createProjectInput = z.object({
  name: z.string().min(1).max(100),
});
export type CreateProjectInput = z.infer<typeof createProjectInput>;

// managers.ts - SQL queries
export class ProjectManager {
  static async list(userId: string, orgId: string) {
    return sql`SELECT * FROM projects WHERE organization_id = ${orgId}`;
  }
}

// functions.ts - Server functions
export const listProjects = createAuthServerFn()
  .middleware([requireOrgUserMiddleware])
  .handler(async ({ context }) => {
    return ProjectManager.list(context.user.id, context.activeOrganizationId);
  });

// queries.ts - TanStack Query
export const getProjectsQueryOptions = (orgId: string) => ({
  queryKey: ["projects", "list", orgId],
  queryFn: () => listProjects(),
});
```

Routes import from modules, keeping UI thin:
```typescript
import { getProjectsQueryOptions } from "@/lib/modules/projects/queries";
```
- **DB Tips**: The configured Postgres client already applies `toCamel` transforms, so avoid hand-written snake_case row types—select columns with `as` aliases instead.
- **Zod 4**: Use the new helpers like `z.uuid()` and `z.email()` instead of chaining off `z.string()`.

## Tech Stack
- **Auth**: better-auth with multi-tenant organizations/members
- **DB**: Drizzle ORM with TypeScript types
- **Router**: TanStack Router with file-based routing
- **Workflows**: Restate for durable service orchestration with Zod schemas


## Coding Guidelines

### Auth

Every route under "_app" is protected and there is a session and activeOrganizationId.
This is validated via middleware and auth context.

### Tanstack Start + Query

You should always create query options and suspense query hooks.
This will be used on Router loaders.

```typescript
export const getProjectsQueryOptions = (organizationId: string) => ({
	queryKey: projectsQueryKey(organizationId),
	queryFn: async (): Promise<ProjectListResponse> =>
		listActiveOrganizationProjects(),
});

// Do
const projects = useSuspenseQuery(getProjectsQueryOptions(organizationId));

// Don't
export function useProjectsQuery(organizationId: string) {
	return useSuspenseQuery(getProjectsQueryOptions(organizationId));
}

// Route
export const Route = createFileRoute("/_app/projects/")({
	loader: async ({ context }) => {
		const organizationId = context.session.activeOrganizationId;
		if (organizationId) {
			await context.queryClient.ensureQueryData(
				getProjectsQueryOptions(organizationId),
			);
		}
	},
	component: ProjectsRouteComponent,
});
```



### Zod

```typescript
// By default, fields are required.
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Use .optional() to define optional fields.
const userSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
});

// String formats
z.email();
z.uuid();
z.url();
z.httpUrl();       // http or https URLs only
z.hostname();
z.emoji();         // validates a single emoji character
z.base64();
z.base64url();
z.hex();
z.jwt();
z.nanoid();
z.cuid();
z.cuid2();
z.ulid();
z.ipv4();
z.ipv6();
z.cidrv4();        // ipv4 CIDR block
z.cidrv6();        // ipv6 CIDR block
z.hash("sha256");  // or "sha1", "sha384", "sha512", "md5"
z.iso.date();
z.iso.time();
z.iso.datetime();
z.iso.duration();

// ISO Datetimes
const datetime = z.iso.datetime();

datetime.parse("2020-01-01T06:15:00Z"); // ✅
datetime.parse("2020-01-01T06:15:00.123Z"); // ✅
datetime.parse("2020-01-01T06:15:00.123456Z"); // ✅ (arbitrary precision)
datetime.parse("2020-01-01T06:15:00+02:00"); // ❌ (offsets not allowed)
datetime.parse("2020-01-01T06:15:00"); // ❌ (local not allowed)
```

## Postgres.js

```typescript
// Transform the column names only to camel case
// (for the results that are returned from the query)
postgres({ transform: postgres.toCamel })

await sql`CREATE TABLE IF NOT EXISTS camel_case (a_test INTEGER)`
await sql`INSERT INTO camel_case ${ sql([{ a_test: 1 }]) }`
const data = await sql`SELECT a_test FROM camel_case`

console.log(data) // [ { aTest: 1 } ]
```
