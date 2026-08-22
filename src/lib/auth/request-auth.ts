import { unauthorized } from "@/lib/api/errors";
import { getSessionUser, readSessionToken } from "@/lib/auth/session";

export type AuthContext = {
  userId: string;
  via: "session" | "key";
};

export async function authenticateRequest(
  req: Request,
): Promise<AuthContext> {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    throw unauthorized("API keys are issued in the lab.");
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
