import { type NextFunction, type Request, type Response } from "express";
import { type OpenAPIBackend, type Context } from "openapi-backend";

import { requireBearerAuth, isAuthStrict } from "../middleware/auth";
import { OPERATION_IDS } from "./operations";

export const PROTECTED_OPERATION_IDS = [
  OPERATION_IDS.addPet,
  OPERATION_IDS.updatePet,
  OPERATION_IDS.deletePet,
  OPERATION_IDS.uploadFile
] as const;

const PROTECTED_OPERATION_SET = new Set<string>(PROTECTED_OPERATION_IDS);

export function registerSecurityHandlers(api: OpenAPIBackend): void {
  api.registerSecurityHandler("Authorization", (context: Context) => {
    const header = context.request.headers.authorization;
    const valid = typeof header === "string" && /^Bearer\s+\S+$/i.test(header);

    if (!isAuthStrict()) {
      return true;
    }

    return valid;
  });
}

export function applyOperationSecurity(
  operationId: string,
  req: Request,
  res: Response,
  next: NextFunction,
  handler: () => void
): void {
  if (!PROTECTED_OPERATION_SET.has(operationId)) {
    handler();
    return;
  }

  req.headers["x-operation-id"] = operationId;
  requireBearerAuth(req, res, () => {
    next();
    handler();
  });
}
