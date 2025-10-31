import { SQL } from "bun";

export const db = new SQL(Bun.env.DATABASE_URL!);
