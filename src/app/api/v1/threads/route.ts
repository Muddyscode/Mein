import { db } from "@/lib/db/client";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { createThread, listThreads } from "@/lib/domain/threads";
import { createThreadSchema } from "@/lib/validation/thread";

export const GET = withAuth(async (_req, auth) => {
  return json({ data: listThreads(db, auth.userId) });
});

export const POST = withAuth(async (req, auth) => {
  const body: unknown = await req.json();
  const input = createThreadSchema.parse(body);
  const thread = createThread(db, auth.userId, input);
  return json({ data: thread }, 201);
});
