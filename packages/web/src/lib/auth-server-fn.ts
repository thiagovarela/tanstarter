import { createServerFn } from "@tanstack/react-start";
import { requireSessionMiddleware } from "./middleware";

export const createAuthServerFn = createServerFn().middleware([
	requireSessionMiddleware,
]);
