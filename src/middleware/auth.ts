import { type NextFunction, type Request, type Response } from "express";

import { formatError } from "../lib/errorFormatter";

type AuthState = {
  authorized: boolean;
  reason?: "missing_or_invalid" | "present";
  mode: "strict" | "permissive";
};

type AuthenticatedRequest = Request & {
  auth?: AuthState;
};

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
  const authReq = req as AuthenticatedRequest;
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
    authReq.auth = {
      authorized: true,
      reason: "present",
      mode: isAuthStrict() ? "strict" : "permissive"
    };
    next();
    return;
  }

  if (!isAuthStrict()) {
    authReq.auth = {
      authorized: false,
      reason: "missing_or_invalid",
      mode: "permissive"
    };
    console.warn("AUTH_STRICT=false bypassing unauthorized request");
    next();
    return;
  }

  authReq.auth = {
    authorized: false,
    reason: "missing_or_invalid",
    mode: "strict"
  };

  res
    .status(401)
    .json(formatError("UNAUTHORIZED", "Bearer token required", { operationId }));
}
