export type ErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "internal";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function unauthorized(message = "Sign in or provide an API key."): AppError {
  return new AppError("unauthorized", message, 401);
}

export function forbidden(message = "Not allowed."): AppError {
  return new AppError("forbidden", message, 403);
}

export function notFound(message = "Not found."): AppError {
  return new AppError("not_found", message, 404);
}

export function validationError(
  message: string,
  details?: Record<string, unknown>,
): AppError {
  return new AppError("validation_error", message, 400, details);
}
