import { count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function ownerExists(): Promise<boolean> {
  const row = await db.select({ value: count() }).from(users).get();
  return (row?.value ?? 0) > 0;
}
