import { Link as RouterLink } from "@tanstack/react-router";
import { Fragment } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import {
	ShellBreadcrumbProvider,
	useShellBreadcrumbContext,
} from "./shell-breadcrumb-context";

export function Shell({ children }: React.PropsWithChildren) {
	return (
		<ShellBreadcrumbProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<PathAwareHeader />
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</ShellBreadcrumbProvider>
	);
}

function PathAwareHeader() {
	const { breadcrumbs } = useShellBreadcrumbContext();

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 justify-between">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((crumb, index) => {
							const isLast = index === breadcrumbs.length - 1;
							return (
								<Fragment key={`${crumb.label}-${index}`}>
									<BreadcrumbItem>
										{!isLast && crumb.to ? (
											<BreadcrumbLink asChild>
												<RouterLink to={crumb.to}>{crumb.label}</RouterLink>
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
										)}
									</BreadcrumbItem>
									{!isLast ? <BreadcrumbSeparator /> : null}
								</Fragment>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<div className="flex items-center gap-2 px-4">
				<ThemeToggle />
			</div>
		</header>
	);
}
