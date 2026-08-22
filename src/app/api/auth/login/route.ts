import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validation/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { applySessionCookies, createSession } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/errors";
import { json, toErrorResponse } from "@/lib/api/respond";

export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();
    const input = loginSchema.parse(body);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .get();
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw unauthorized("Email or password is wrong.");
    }
    const token = await createSession(user.id);
    const response = json({
      data: {
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
    applySessionCookies(response, token);
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
