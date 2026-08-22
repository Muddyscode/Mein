import { db } from "@/lib/db/client";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { createApiKey, listApiKeys } from "@/lib/domain/keys";
import { createKeySchema } from "@/lib/validation/key";

export const GET = withAuth(async (_req, auth) => {
  return json({ data: listApiKeys(db, auth.userId) });
});

export const POST = withAuth(async (req, auth) => {
  const body: unknown = await req.json();
  const input = createKeySchema.parse(body);
  const created = createApiKey(db, auth.userId, input.name);
  return json({ data: created }, 201);
});
