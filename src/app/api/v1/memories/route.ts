import { db } from "@/lib/db/client";
import { parseLimit } from "@/lib/api/pagination";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { listMemories } from "@/lib/domain/memories";
import { listMemoriesQuerySchema } from "@/lib/validation/memory";

export const GET = withAuth(async (req, auth) => {
  const url = new URL(req.url);
  const query = listMemoriesQuerySchema.parse(
    Object.fromEntries(url.searchParams.entries()),
  );
  const result = listMemories(db, auth.userId, {
    q: query.q,
    tag: query.tag,
    threadId: query.threadId,
    status: query.status,
    limit: parseLimit(query.limit ?? null),
    cursor: query.cursor,
  });
  return json(result);
});
