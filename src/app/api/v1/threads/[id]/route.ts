import { db } from "@/lib/db/client";
import { empty, json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { deleteThread, getThread, updateThread } from "@/lib/domain/threads";
import { patchThreadSchema } from "@/lib/validation/thread";

export const GET = withAuth(async (_req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  const result = getThread(db, auth.userId, id);
  return json({ data: { ...result.thread, memories: result.memories } });
});

export const PATCH = withAuth(async (req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  const body: unknown = await req.json();
  const patch = patchThreadSchema.parse(body);
  return json({ data: updateThread(db, auth.userId, id, patch) });
});

export const DELETE = withAuth(async (_req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  deleteThread(db, auth.userId, id);
  return empty(204);
});
