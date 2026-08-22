import { db } from "@/lib/db/client";
import { json } from "@/lib/api/respond";
import { withAuth } from "@/lib/api/with-auth";
import { exportKnowledge } from "@/lib/domain/export";

export const GET = withAuth(async (_req, auth) => {
  return json(exportKnowledge(db, auth.userId));
});
