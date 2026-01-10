import { createContext, useContext, useEffect, useState } from "react";

export type ShellBreadcrumb = {
	label: string;
	to?: string;
};

const defaultBreadcrumbs: ShellBreadcrumb[] = [{ label: "Overview" }];

type ShellBreadcrumbContextValue = {
	breadcrumbs: ShellBreadcrumb[];
	setBreadcrumbs: React.Dispatch<React.SetStateAction<ShellBreadcrumb[]>>;
};

const ShellBreadcrumbContext =
	createContext<ShellBreadcrumbContextValue | null>(null);

export function ShellBreadcrumbProvider({ children }: React.PropsWithChildren) {
	const [breadcrumbs, setBreadcrumbs] =
		useState<ShellBreadcrumb[]>(defaultBreadcrumbs);

	const value = { breadcrumbs, setBreadcrumbs };

	return (
		<ShellBreadcrumbContext.Provider value={value}>
			{children}
		</ShellBreadcrumbContext.Provider>
	);
}

export function useShellBreadcrumbContext() {
	const context = useContext(ShellBreadcrumbContext);
	if (!context) {
		throw new Error(
			"useShellBreadcrumbContext must be used within ShellBreadcrumbProvider",
		);
	}
	return context;
}

export function useShellBreadcrumbs(breadcrumbs: ShellBreadcrumb[]) {
	const { setBreadcrumbs } = useShellBreadcrumbContext();

	useEffect(() => {
		setBreadcrumbs(breadcrumbs);
		return () => setBreadcrumbs(defaultBreadcrumbs);
	}, [breadcrumbs, setBreadcrumbs]);
}
