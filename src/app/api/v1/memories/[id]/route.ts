import { db } from "@/lib/db/client";
import { empty, json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import {
  archiveMemory,
  getMemory,
  hardDeleteMemory,
  updateMemory,
} from "@/lib/domain/memories";
import { patchMemorySchema } from "@/lib/validation/memory";

export const GET = withAuth(async (_req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  return json({ data: getMemory(db, auth.userId, id) });
});

export const PATCH = withAuth(async (req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  const body: unknown = await req.json();
  const patch = patchMemorySchema.parse(body);
  return json({ data: updateMemory(db, auth.userId, id, patch) });
});

export const DELETE = withAuth(async (req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  const hard = new URL(req.url).searchParams.get("hard") === "true";
  if (hard) {
    hardDeleteMemory(db, auth.userId, id);
  } else {
    archiveMemory(db, auth.userId, id);
  }
  return empty(204);
});
