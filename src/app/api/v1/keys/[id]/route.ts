import { db } from "@/lib/db/client";
import { empty, json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { revokeApiKey } from "@/lib/domain/keys";

export const DELETE = withAuth(async (_req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  revokeApiKey(db, auth.userId, id);
  return empty(204);
});
