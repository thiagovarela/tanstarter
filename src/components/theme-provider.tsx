"use client";

import { useEffect } from "react";

interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	useEffect(() => {
		// Get stored theme or default to system
		const stored = localStorage.getItem("theme") as
			| "dark"
			| "light"
			| "system"
			| null;
		const theme = stored || "system";

		const root = document.documentElement;

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}
	}, []);

	return <>{children}</>;
}
