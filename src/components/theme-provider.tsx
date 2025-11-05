"use client";

import { useLayoutEffect } from "react";

interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	useLayoutEffect(() => {
		// Get stored theme or default to dark
		const stored = localStorage.getItem("theme") as
			| "dark"
			| "light"
			| "system"
			| null;
		const theme = stored ?? "dark";

		if (!stored) {
			localStorage.setItem("theme", "dark");
		}

		const root = document.documentElement;
		root.classList.remove("light", "dark");

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
