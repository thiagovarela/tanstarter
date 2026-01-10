import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function applyTheme(selectedTheme: Theme, setIsDark: (dark: boolean) => void) {
	const root = window.document.documentElement;
	root.classList.remove("light", "dark");

	if (selectedTheme === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";

		root.classList.add(systemTheme);
		setIsDark(systemTheme === "dark");
	} else {
		root.classList.add(selectedTheme);
		setIsDark(selectedTheme === "dark");
	}
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>("system");
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Get stored theme or default to system
		const stored = localStorage.getItem("theme") as Theme | null;
		const initialTheme = stored || "dark";
		setTheme(initialTheme);

		// Apply theme
		applyTheme(initialTheme, setIsDark);
	}, []);

	useEffect(() => {
		applyTheme(theme, setIsDark);
	}, [theme]);

	function setThemeWithStorage(newTheme: Theme) {
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
	}

	// Listen for system theme changes when using system theme
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		function handleChange(e: MediaQueryListEvent) {
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(e.matches ? "dark" : "light");
			setIsDark(e.matches);
		}

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return {
		theme,
		setTheme: setThemeWithStorage,
		isDark,
		toggleTheme: () => {
			const newTheme =
				theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
			setThemeWithStorage(newTheme);
		},
	};
}
