import { type ApiErrorResponse } from "../types/error";

export function formatError(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  if (details === undefined) {
    return { code, message };
  }

  return { code, message, details };
}
