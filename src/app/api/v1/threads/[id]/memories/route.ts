import { db } from "@/lib/db/client";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { attachMemory } from "@/lib/domain/threads";
import { attachMemorySchema } from "@/lib/validation/thread";

export const POST = withAuth(async (req, auth, params) => {
  const id = params.id;
  if (!id) {
    return json({ error: { code: "not_found", message: "Not found." } }, 404);
  }
  const body: unknown = await req.json();
  const input = attachMemorySchema.parse(body);
  const result = attachMemory(db, auth.userId, id, input.memoryId);
  return json(
    {
      data: {
        threadId: result.threadId,
        memoryId: result.memoryId,
        position: result.position,
      },
    },
    result.created ? 201 : 200,
  );
});
