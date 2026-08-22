import { db } from "@/lib/db/client";
import { empty, json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { detachMemory } from "@/lib/domain/threads";

export const DELETE = withAuth(async (_req, auth, params) => {
  const id = params.id;
  const memoryId = params.memoryId;
  if (!id || !memoryId) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  detachMemory(db, auth.userId, id, memoryId);
  return empty(204);
});
