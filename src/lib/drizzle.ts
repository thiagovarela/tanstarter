import { drizzle } from "drizzle-orm/bun-sql";
import { sql } from "@/lib/db.ts";

export const client = drizzle({ client: sql, casing: "snake_case" });
