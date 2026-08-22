import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { newId } from "@/lib/db/ids";
import { sessions, users } from "@/lib/db/schema";
import {
  BOOT_COOKIE,
  SESSION_COOKIE,
  bootCookieOptions,
  sessionCookieOptions,
  parseCookieHeader,
} from "@/lib/auth/cookies";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SLIDING_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export type PublicUser = {
  id: string;
  email: string;
  name: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.insert(sessions).values({
    id: newId(),
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    createdAt: now,
  });
  return token;
}

export async function getSessionUser(
  token: string,
): Promise<PublicUser | null> {
  const tokenHash = hashToken(token);
  const row = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .get();

  if (!row) {
    return null;
  }
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.sessionId));
    return null;
  }
  if (row.expiresAt.getTime() - Date.now() < SLIDING_REFRESH_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
      .where(eq(sessions.id, row.sessionId));
  }
  return { id: row.userId, email: row.email, name: row.name };
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export function readSessionToken(req: Request): string | null {
  return parseCookieHeader(req.headers.get("cookie")).get(SESSION_COOKIE) ?? null;
}

export function applySessionCookies(response: Response, token: string): void {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const session = sessionCookieOptions(maxAge);
  const boot = bootCookieOptions();
  response.headers.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, token, session),
  );
  response.headers.append(
    "Set-Cookie",
    serializeCookie(BOOT_COOKIE, "1", boot),
  );
}

export function clearSessionCookies(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, "", {
      ...sessionCookieOptions(0),
      maxAge: 0,
    }),
  );
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    path: string;
    secure: boolean;
    maxAge: number;
  },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    "SameSite=Lax",
  ];
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}
