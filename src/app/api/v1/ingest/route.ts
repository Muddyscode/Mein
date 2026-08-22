import { db } from "@/lib/db/client";
import { withAuth } from "@/lib/api/with-auth";
import { json } from "@/lib/api/respond";
import { ingestSource } from "@/lib/domain/ingest";
import { ingestSchema } from "@/lib/validation/ingest";

export const POST = withAuth(async (req, auth) => {
  const body: unknown = await req.json();
  const input = ingestSchema.parse(body);
  const data = await ingestSource(db, auth.userId, input);
  return json({ data }, 201);
});
