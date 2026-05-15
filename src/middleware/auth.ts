import { type NextFunction, type Request, type Response } from "express";

import { formatError } from "../lib/errorFormatter";

export function isAuthStrict(): boolean {
  return process.env.AUTH_STRICT !== "false";
}

function hasValidBearerHeader(header: string | undefined): boolean {
  if (!header) {
    return false;
  }

  return /^Bearer\s+\S+$/i.test(header);
}

export function requireBearerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const operationId =
    typeof req.headers["x-operation-id"] === "string"
      ? req.headers["x-operation-id"]
      : "unknown";
  const headerFromHeaders =
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : undefined;
  const headerFromMethod =
    typeof req.header === "function" ? req.header("authorization") : undefined;
  const header = headerFromHeaders ?? headerFromMethod;
  const valid = hasValidBearerHeader(header);

  if (valid) {
    req.auth = {
      authorized: true,
      reason: "present",
      mode: isAuthStrict() ? "strict" : "permissive"
    };
    next();
    return;
  }

  if (!isAuthStrict()) {
    req.auth = {
      authorized: false,
      reason: "missing_or_invalid",
      mode: "permissive"
    };
    console.warn("AUTH_STRICT=false bypassing unauthorized request");
    next();
    return;
  }

  req.auth = {
    authorized: false,
    reason: "missing_or_invalid",
    mode: "strict"
  };

  res
    .status(401)
    .json(formatError("UNAUTHORIZED", "Bearer token required", { operationId }));
}
