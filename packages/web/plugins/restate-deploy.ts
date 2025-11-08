import type { Plugin } from "vite";

import { registerRestateDeployment } from "../scripts/register-restate";

const WATCHED_GLOBS = ["src/lib/workflows", "src/routes/api/restate"];

export function restateDeployPlugin(): Plugin {
	return {
		name: "restate-deploy",
		apply: "serve",
		configureServer(server) {
			let running = false;
			let pendingReason: string | null = null;
			let timer: NodeJS.Timeout | undefined;

			const scheduleDeployment = (reason: string) => {
				pendingReason = reason;
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(triggerDeployment, 250);
			};

			const triggerDeployment = async () => {
				if (running) {
					return;
				}
				running = true;
				const reason = pendingReason ?? "unknown";
				pendingReason = null;

				try {
					console.log(
						`[restate-deploy] Registering deployment (reason: ${reason})...`,
					);
					await registerRestateDeployment();
				} catch (error) {
					const message =
						error instanceof Error ? error.message : String(error);
					console.error(
						"[restate-deploy] Failed to register deployment:",
						message,
					);
				} finally {
					running = false;
				}
			};

			const shouldTrigger = (file: string) =>
				WATCHED_GLOBS.some((pattern) => file.includes(pattern));

			server.watcher.on("add", (file) => {
				if (shouldTrigger(file)) {
					scheduleDeployment(`file-add:${file}`);
				}
			});
			server.watcher.on("change", (file) => {
				if (shouldTrigger(file)) {
					scheduleDeployment(`file-change:${file}`);
				}
			});

			server.httpServer?.once("listening", () => {
				scheduleDeployment("dev-server-start");
			});
		},
	};
}

export default restateDeployPlugin;
