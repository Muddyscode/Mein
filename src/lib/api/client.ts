export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  if (res.status === 204) {
    return undefined as T;
  }
  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = readError(payload);
    throw new ApiRequestError(
      res.status,
      error.code,
      error.message,
      error.details,
    );
  }
  return payload as T;
}

function readError(payload: unknown): {
  code: string;
  message: string;
  details?: Record<string, unknown>;
} {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null
  ) {
    const error = payload.error as {
      code?: unknown;
      message?: unknown;
      details?: Record<string, unknown>;
    };
    return {
      code: typeof error.code === "string" ? error.code : "internal",
      message:
        typeof error.message === "string"
          ? error.message
          : "Request failed.",
      details: error.details,
    };
  }
  return { code: "internal", message: "Request failed." };
}
