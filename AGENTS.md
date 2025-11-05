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
- **File structure**: `src/routes/` (feature-based) with a sub folder "-components", `src/components/ui/` (core), `src/lib/workflows/` (workflows)
- **Styling**: Tailwind CSS with class-variance-authority, cn() utility for classes
- **Workflows**: Restate services in `src/lib/workflows/` with durable execution, Zod validation, and endpoint handlers in routes
- **DB Tips**: The configured Postgres client already applies `toCamel` transforms, so avoid hand-written snake_case row types—select columns with `as` aliases instead.
- **Zod 4**: Use the new helpers like `z.uuid()` and `z.email()` instead of chaining off `z.string()`.

## Tech Stack
- **Auth**: better-auth with multi-tenant organizations/members
- **DB**: Drizzle ORM with TypeScript types
- **Router**: TanStack Router with file-based routing
- **Workflows**: Restate for durable service orchestration with Zod schemas
