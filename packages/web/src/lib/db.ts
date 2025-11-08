import { createDbClient, createDrizzleClient } from "@tanstarter/data";
import { env } from "./env";

export const sql = createDbClient(env.DATABASE_URL);
export const db = sql;

export const client = createDrizzleClient(env.DATABASE_URL);
