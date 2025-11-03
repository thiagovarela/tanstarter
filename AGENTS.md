# Tanstart- Agent Guidelines

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
- **File structure**: `src/routes/` (feature-based) with a sub folder "-components", `src/components/ui/` (core), `src/lib/workflows/` (workflows)
- **Styling**: Tailwind CSS with class-variance-authority, cn() utility for classes
- **Workflows**: Restate services in `src/lib/workflows/` with durable execution, Zod validation, and endpoint handlers in routes

## Tech Stack
- **Auth**: better-auth with multi-tenant organizations/members
- **DB**: Drizzle ORM with TypeScript types
- **Router**: TanStack Router with file-based routing
- **Workflows**: Restate for durable service orchestration with Zod schemas
