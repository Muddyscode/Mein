import { getSessionUser, readSessionToken } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/errors";
import { json, toErrorResponse } from "@/lib/api/respond";

export async function GET(req: Request): Promise<Response> {
  try {
    const token = readSessionToken(req);
    if (!token) {
      throw unauthorized();
    }
    const user = await getSessionUser(token);
    if (!user) {
      throw unauthorized("Session expired. Sign in again.");
    }
    return json({ data: { user } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
