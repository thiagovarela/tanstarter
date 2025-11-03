import { drizzle } from "drizzle-orm/postgres-js";

import { sql } from "@/lib/db";

export const client = drizzle(sql, { casing: "snake_case" });
