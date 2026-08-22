import { unauthorized } from "@/lib/api/errors";
import { getSessionUser, readSessionToken } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { verifyApiKey } from "@/lib/domain/keys";

export type AuthContext = {
  userId: string;
  via: "session" | "key";
};

export async function authenticateRequest(
  req: Request,
): Promise<AuthContext> {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const key = header.slice(7).trim();
    const verified = verifyApiKey(db, key);
    if (!verified) {
      throw unauthorized("API key revoked or invalid.");
    }
    return { userId: verified.userId, via: "key" };
  }

  const token = readSessionToken(req);
  if (!token) {
    throw unauthorized();
  }
  const user = await getSessionUser(token);
  if (!user) {
    throw unauthorized("Session expired. Sign in again.");
  }
  return { userId: user.id, via: "session" };
}
