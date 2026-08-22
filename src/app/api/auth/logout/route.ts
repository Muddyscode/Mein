import {
  clearSessionCookies,
  destroySession,
  readSessionToken,
} from "@/lib/auth/session";
import { json, toErrorResponse } from "@/lib/api/respond";

export async function POST(req: Request): Promise<Response> {
  try {
    const token = readSessionToken(req);
    if (token) {
      await destroySession(token);
    }
    const response = json({ data: { ok: true } });
    clearSessionCookies(response);
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
