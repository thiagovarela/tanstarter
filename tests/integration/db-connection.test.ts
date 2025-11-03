import { test, expect } from "bun:test";

import { sql } from "@/lib/db";

test("executes a simple query against postgres", async () => {
	const [row] = await sql<{ value: number }[]>`
		select 1 as value
	`;

	expect(row.value).toBe(1);
});
