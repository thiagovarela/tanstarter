Welcome to Tanstarter!

A production-ready SaaS boilerplate built with modern TypeScript patterns, focusing on simplicity and developer productivity.

UI's are not that great but a starting point ;)

## Architecture Overview

Tanstarter focuses on **simplicity and reliability** - practical solutions that work well without unnecessary complexity. The stack is carefully chosen for productivity and scalability:

### Core Infrastructure
- **PostgreSQL 18** - Primary database with automatic camelCase transformation
- **Restate** - Durable execution for background jobs, scheduling, and workflows
- **Better-Auth** - Multi-tenant authentication with organization support

### Key Architectural Decisions
- **SSR-First** - TanStack Start with full server-side rendering
- **Type Safety** - End-to-end TypeScript with Zod validation
- **Multi-tenant** - Built-in organization support from day one
- **Durable Workflows** - Reliable background processing with Restate

## 🏗️ Project Structure

```
src/
├── routes/                 # File-based routing
│   ├── __root.tsx         # Root layout
│   ├── _auth.tsx          # Auth layout
│   ├── _app.tsx           # Protected app layout
│   ├── _auth/             # Auth routes (login, register)
│   ├── _app/              # Protected routes
│   │   ├── projects/       # Feature routes with -components/
│   │   └── settings/      # Settings routes
│   └── api/               # API endpoints
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── form/              # Form components
│   ├── shell/             # Layout components
│   └── table/             # Table components
├── lib/
│   ├── workflows/         # Restate services
│   ├── auth/              # Auth utilities
│   └── schema/           # Database schemas
└── hooks/                # Custom React hooks
```

## 🔐 Authentication Patterns

### Multi-tenant Organization Structure
- Every user gets a default organization created automatically via Restate workflow
- Sessions include `activeOrganizationId` for context switching
- Role-based permissions: `owner` > `admin` > `member`

### Auth Flow Integration
```typescript
// User creation triggers workflow
await restateClient.serviceClient(Accounts).afterUserCreated({
  user,
  organizationId,
}, restate.rpc.opts({ idempotencyKey: user.id }));

// Protected routes with middleware
export const Route = createFileRoute("/_app/projects/")({
  loader: async ({ context }) => {
    const organizationId = context.session.activeOrganizationId;
    // context includes session + organization roles
  },
});
```

## 🗄️ Database Patterns

### Dual Approach
- **Drizzle ORM** for schema management and better-auth integration
- **Raw postgresjs** for queries with automatic camelCase transformation

### Schema Conventions
```typescript
// UUID primary keys with helper
export const organizations = pgTable("organizations", {
  id: primaryKey("id"),
  name: text("name").notNull(),
  createdAt: ts("created_at").defaultNow(),
});

// Automatic snake_case → camelCase
const data = await sql`SELECT created_at FROM organizations`;
// Returns: { createdAt: "2025-01-01T00:00:00Z" }
```

## 🔄 Data Fetching Patterns

### TanStack Query + Router Integration
```typescript
// Query options pattern
export const getProjectsQueryOptions = (organizationId: string) => ({
  queryKey: projectsQueryKey(organizationId),
  queryFn: async (): Promise<ProjectListResponse> =>
    listActiveOrganizationProjects(),
});

// Route loader for SSR
export const Route = createFileRoute("/_app/projects/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      getProjectsQueryOptions(organizationId),
    );
  },
  component: ProjectsRouteComponent,
});

// Direct usage in components (no wrapper functions)
function ProjectsList({ organizationId }: { organizationId: string }) {
  const { data } = useSuspenseQuery(getProjectsQueryOptions(organizationId));
  return <ProjectsTable projects={data.projects} />;
}
```

## 🧩 Component Patterns

### shadcn/ui Integration
- Components in `src/components/ui/` following Radix UI patterns
- Form components using TanStack Form with Zod validation
- Custom field components for consistent forms

### Layout System
```typescript
// Shell with sidebar navigation
<Shell>
  <ShellSidebar>
    <NavProjects />
    <NavSecondary />
  </ShellSidebar>
  <ShellContent>
    <ShellBreadcrumb />
    <Outlet />
  </ShellContent>
</Shell>

// Context-based breadcrumbs
useShellBreadcrumbs([
  { label: "Organizations", to: "/settings/organizations" },
  { label: organization.name },
]);
```

## ⚡ Workflow Patterns

### Restate Durable Execution
```typescript
// Services in src/lib/workflows/
export const accounts = restate.service({
  name: "accounts",
  handlers: {
    create: async (ctx, input: CreateAccountInput) => {
      // Idempotent user creation
      const user = await createUser(input);

      // Send welcome email
      await ctx.invoke(workflows.email.send, {
        to: user.email,
        template: "welcome",
      });

      // Create default organization
      await ctx.invoke(workflows.organizations.create, {
        userId: user.id,
        name: "Default Organization",
      });
    },
  },
});
```

## 🧪 Testing Patterns

### Testcontainers Integration
```typescript
// Isolated PostgreSQL for each test run
const testContainer = await new PostgresContainer().start();
const testDb = postgres(testContainer.getConnectionUri());

// Automatic schema migration
await migrate(testDb, { migrationsFolder: "migrations" });

// Cleanup between tests
afterEach(async () => {
  await testDb`TRUNCATE TABLE users, organizations CASCADE`;
});
```

## 🛠️ Development Patterns

### Environment Management
```typescript
// Zod-based environment validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  RESTATE_URL: z.string().url(),
  VITE_MEDIA_PUBLIC_BASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Code Quality
- **Biome** for linting/formatting with tab indentation
- **Husky** pre-commit hooks for code quality
- **Strict TypeScript** with no unused locals/parameters
- **Path aliases** with `@/` prefix

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start development (includes Postgres + Restate)
docker-compose up -d
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

## 📦 Key Dependencies

- **TanStack** - Router, Query, Form, Start (SSR)
- **Better-Auth** - Authentication with organization support
- **Drizzle** - Schema management and migrations
- **Restate** - Durable workflow execution
- **shadcn/ui** - Component library built on Radix UI
- **Tailwind CSS** - Utility-first styling
- **Biome** - Linting and formatting
- **Vitest** - Testing with Testcontainers

## 🎯 Design Principles

1. **Simplicity First** - Keep things simple and practical, avoid unnecessary complexity
2. **Type Safety** - End-to-end TypeScript with Zod validation
3. **Developer Experience** - Hot reload, auto-formatting, comprehensive tooling
4. **Production Ready** - Durable workflows, proper error handling, monitoring
5. **Multi-tenant** - Built-in organization support from day one


# Getting Started

To run this application:

```bash
bun install
bun --bun run start
```

# Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun --bun run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```


## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpx shadcn@latest add button
```



## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
bun install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
bun install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
