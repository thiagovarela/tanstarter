import { drizzle } from "drizzle-orm/bun-sql";
import { db } from "@/lib/db.ts";

export const client = drizzle({ client: db, casing: "snake_case" });
