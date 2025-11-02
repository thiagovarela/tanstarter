type AuthClientError = {
	message?: string;
	code?: string;
	status: number;
	statusText: string;
} & Record<string, unknown>;

function humanizeCode(code: string) {
	return code
		.split("_")
		.filter(Boolean)
		.map((segment) =>
			segment.length > 0
				? segment[0].toUpperCase() + segment.slice(1).toLowerCase()
				: segment,
		)
		.join(" ");
}

export function getAuthErrorMessage(error: AuthClientError) {
	if (typeof error.message === "string" && error.message.trim().length > 0) {
		return error.message;
	}
	if (typeof error.code === "string" && error.code.trim().length > 0) {
		return humanizeCode(error.code.trim());
	}
	return `Request failed (${error.status} ${error.statusText})`;
}

export type { AuthClientError };
