import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Github,
	Layers,
	Route as RouteIcon,
	ServerCog,
	ShieldCheck,
	Workflow,
	Zap,
} from "lucide-react";
import { useId } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const featuresId = useId();
	const getStartedId = useId();

	const primaryFeatures = [
		{
			icon: <Zap className="h-10 w-10 text-cyan-400" />,
			title: "Launch in Minutes",
			description:
				"Opinionated project wiring, automated scaffolds, and production-ready defaults so you can ship the first commit fast.",
		},
		{
			icon: <ServerCog className="h-10 w-10 text-cyan-400" />,
			title: "Full-Stack Superpowers",
			description:
				"TanStack Start server functions, streaming rendering, and file-based routing wired with typed API endpoints.",
		},
		{
			icon: <Workflow className="h-10 w-10 text-cyan-400" />,
			title: "Durable Workflows",
			description:
				"Restate-powered workflows, job orchestration, and background task patterns with Zod validation and retries baked in.",
		},
	];

	const capabilityColumns = [
		{
			heading: "Platform",
			items: [
				"Multi-tenant organizations with role management",
				"Better Auth flows plugged into protected routes",
				"Audit-ready logging and environment guardrails",
			],
		},
		{
			heading: "Backend",
			items: [
				"Drizzle ORM models synced with PostgreSQL migrations",
				"Prisma-style data access patterns without the bloat",
				"Background jobs triggered from server functions or workflows",
			],
		},
		{
			heading: "UI & DX",
			items: [
				"shadcn/ui foundations with cva variants and theming",
				"Composable dashboards, tables, and form primitives",
				"Biome formatting, strict TypeScript, and zero unused code",
			],
		},
	];

	const integrationHighlights = [
		{
			title: "TanStack Router + Query",
			copy: "Nested layouts, loader orchestration, and data caching unified in one mental model.",
		},
		{
			title: "TanStack Form + Zod",
			copy: "Declarative forms with inline validation, async submission states, and accessible errors.",
		},
		{
			title: "Restate Services",
			copy: "Serverless-friendly durable execution with replay-safe steps and event sourcing primitives.",
		},
		{
			title: "DX Guardrails",
			copy: "Biome, Vitest, and typed env contracts keep the repo healthy from the start.",
		},
	];

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]"></div>
			<div className="relative">
				<section className="px-6 pb-24 pt-24">
					<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center">
						<div className="text-center lg:text-left">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200">
								<span className="inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
								Ultimate TanStack Start Template
							</div>
							<h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
								Tanstarter helps you ship SaaS faster with TanStack
							</h1>
							<p className="mt-6 text-lg text-slate-300 md:text-xl">
								A batteries-included starter kit that pairs TanStack Start with
								enterprise-ready auth, workflows, data, and UI primitives. Pick
								a vertical, wire your product logic, and deploy.
							</p>
							<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
								<a
									href="/login"
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-400"
								>
									Get Started
									<ArrowRight className="h-4 w-4" />
								</a>
								<a
									href="https://github.com/"
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
								>
									<Github className="h-4 w-4" />
									View Template
								</a>
							</div>
						</div>
						<div className="relative mx-auto flex w-full max-w-md flex-col gap-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm sm:max-w-xl">
							<div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
										Stack
									</span>
									<div className="flex items-center gap-2 text-xs text-slate-400">
										<span>Biome</span>
										<span>●</span>
										<span>Vitest</span>
										<span>●</span>
										<span>Restate</span>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm text-slate-300">
									<div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
										<p className="text-xs font-semibold uppercase text-cyan-200">
											Auth
										</p>
										<p className="mt-2 font-medium text-white">Better Auth</p>
										<p className="text-xs text-slate-400">
											Multi-tenant, memberships, invitations
										</p>
									</div>
									<div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
										<p className="text-xs font-semibold uppercase text-cyan-200">
											Data
										</p>
										<p className="mt-2 font-medium text-white">Drizzle ORM</p>
										<p className="text-xs text-slate-400">
											Schema-first, typed queries, migrations
										</p>
									</div>
									<div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
										<p className="text-xs font-semibold uppercase text-cyan-200">
											Workflows
										</p>
										<p className="mt-2 font-medium text-white">Restate</p>
										<p className="text-xs text-slate-400">
											Durable execution, retries, scheduling
										</p>
									</div>
									<div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
										<p className="text-xs font-semibold uppercase text-cyan-200">
											UI Kit
										</p>
										<p className="mt-2 font-medium text-white">shadcn/ui</p>
										<p className="text-xs text-slate-400">
											cva variants, dark mode, responsive
										</p>
									</div>
								</div>
							</div>
							<div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5 text-center">
								<p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
									Production Ready
								</p>
								<p className="mt-3 text-lg font-semibold text-white">
									Configure tenants, seed data, and deploy in under 15 minutes.
								</p>
								<p className="mt-2 text-sm text-cyan-100/80">
									Pairs with your favorite hosting—VPS, Metal, Containers,
									Serverless.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="px-6 pb-20" id={featuresId}>
					<div className="mx-auto max-w-5xl text-center">
						<h2 className="text-3xl font-bold text-white md:text-4xl">
							Everything founders need on day zero
						</h2>
						<p className="mt-3 text-base text-slate-300 md:text-lg">
							Tanstarter stitches together the best TanStack tooling and
							operational rails so your team skips boilerplate and focuses on
							customer value.
						</p>
					</div>
					<div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
						{primaryFeatures.map((feature) => (
							<div
								key={feature.title}
								className="group flex h-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/20"
							>
								<div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
									{feature.icon}
								</div>
								<div className="space-y-3 text-left">
									<h3 className="text-xl font-semibold text-white">
										{feature.title}
									</h3>
									<p className="text-sm leading-relaxed text-slate-300">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="px-6 pb-24">
					<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_minmax(0,_0.8fr)]">
						<div className="space-y-8">
							<h2 className="text-3xl font-bold text-white md:text-4xl">
								Built for teams shipping serious products
							</h2>
							<p className="text-base text-slate-300 md:text-lg">
								Each capability is wired for strict typing, testing, and secure
								operation. Extend the modules or swap integrations without
								fighting the scaffolding.
							</p>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{capabilityColumns.map((column) => (
									<div
										key={column.heading}
										className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
									>
										<div className="flex items-center gap-3">
											<Layers className="h-5 w-5 text-cyan-400" />
											<p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
												{column.heading}
											</p>
										</div>
										<ul className="mt-4 space-y-3 text-sm text-slate-300">
											{column.items.map((item) => (
												<li key={item} className="flex items-start gap-2">
													<ShieldCheck className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-400" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</div>
						<div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/60">
							<div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20 p-6">
								<h3 className="text-lg font-semibold text-white">
									Workflow-first mindset
								</h3>
								<p className="mt-3 text-sm text-slate-200">
									Tanstarter treats workflows as first-class citizens. Define
									state machines, emit events, and expose resilient endpoints
									without leaving TypeScript.
								</p>
							</div>
							<ul className="space-y-4">
								{integrationHighlights.map((highlight) => (
									<li
										key={highlight.title}
										className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
									>
										<p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
											{highlight.title}
										</p>
										<p className="mt-2 text-sm text-slate-400">
											{highlight.copy}
										</p>
									</li>
								))}
							</ul>
							<div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
										Teams
									</p>
									<RouteIcon className="h-5 w-5 text-cyan-400" />
								</div>
								<p className="mt-3 text-sm text-slate-300">
									Bring the whole stack to your squad: product builders, ops,
									and AI teams share the same primitives and conventions.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="px-6 pb-24" id={getStartedId}>
					<div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/30 bg-slate-950/70 p-10 text-center shadow-2xl shadow-cyan-500/20">
						<div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">
							Start today
						</div>
						<h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
							Skip the scaffolding, focus on your product
						</h2>
						<p className="mt-4 text-base text-slate-300 md:text-lg">
							Fork the repo, add your domain logic, and deploy with confidence.
							Tanstarter keeps the boring parts consistent so your roadmap can
							move.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<a
								href="https://github.com/thiagovarela/tanstarter"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100"
							>
								<Github className="h-4 w-4" />
								Clone the Template
							</a>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
