import { ZodError } from "zod";
import { AppError } from "@/lib/api/errors";

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function empty(status = 204): Response {
  return new Response(null, { status });
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      {
        status: error.status,
        headers:
          error.code === "rate_limited" &&
          typeof error.details?.retryAfter === "number"
            ? { "Retry-After": String(error.details.retryAfter) }
            : undefined,
      },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "validation_error",
          message: "Request failed validation.",
          details: { fieldErrors: error.flatten().fieldErrors },
        },
      },
      { status: 400 },
    );
  }

  console.error("[mein]", error);
  return Response.json(
    {
      error: {
        code: "internal",
        message: "Something went wrong.",
      },
    },
    { status: 500 },
  );
}
