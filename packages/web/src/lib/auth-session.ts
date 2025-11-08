import { createServerFn } from "@tanstack/react-start";

export const getSessionFromContext = createServerFn().handler(
	async ({ context }) => {
		return context.session || null;
	},
);
