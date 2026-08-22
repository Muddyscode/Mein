import { setupSchema } from "@/lib/validation/auth";
import { db } from "@/lib/db/client";
import { newId } from "@/lib/db/ids";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { ownerExists } from "@/lib/auth/owner";
import { applySessionCookies, createSession } from "@/lib/auth/session";
import { forbidden } from "@/lib/api/errors";
import { json, toErrorResponse } from "@/lib/api/respond";

export async function POST(req: Request): Promise<Response> {
  try {
    if (await ownerExists()) {
      throw forbidden("An owner already exists on this machine.");
    }
    const body: unknown = await req.json();
    const input = setupSchema.parse(body);
    const now = new Date();
    const user = {
      id: newId(),
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(users).values(user);
    const token = await createSession(user.id);
    const response = json(
      {
        data: {
          user: { id: user.id, email: user.email, name: user.name },
        },
      },
      201,
    );
    applySessionCookies(response, token);
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
