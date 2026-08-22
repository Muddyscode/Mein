import { db } from "@/lib/db/client";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { createTag, listTags } from "@/lib/domain/tags";
import { createTagSchema } from "@/lib/validation/tag";

export const GET = withAuth(async (_req, auth) => {
  return json({ data: listTags(db, auth.userId) });
});

export const POST = withAuth(async (req, auth) => {
  const body: unknown = await req.json();
  const input = createTagSchema.parse(body);
  const result = createTag(db, auth.userId, input.name, input.color);
  return json({ data: result.tag }, result.created ? 201 : 200);
});
