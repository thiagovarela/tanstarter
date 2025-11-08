import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

import { restateDeployPlugin } from "./plugins/restate-deploy";

export default defineConfig({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json", "../../tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		restateDeployPlugin(),
	],
});