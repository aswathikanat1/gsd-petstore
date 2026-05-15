import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";
import { type PetStatus } from "../types/pet";

const ALLOWED_STATUSES = new Set<PetStatus>(["available", "pending", "sold"]);

function normalizeStatuses(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(",")).map((item) => item.trim());
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim());
  }

  return [];
}

export function handleFindPetsByStatus(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("findPetsByStatus", req, res, () => undefined, () => {
    const rawStatuses = normalizeStatuses(context.request.query.status);

    if (rawStatuses.length === 0) {
      res
        .status(400)
        .json(formatError("INVALID_STATUS", "Invalid status value", { status: rawStatuses }));
      return;
    }

    const invalidStatuses = rawStatuses.filter((status) => !ALLOWED_STATUSES.has(status as PetStatus));
    if (invalidStatuses.length > 0) {
      res
        .status(400)
        .json(formatError("INVALID_STATUS", "Invalid status value", { status: invalidStatuses }));
      return;
    }

    const statuses = rawStatuses as PetStatus[];
    const pets = petRepository.findByStatuses(statuses);
    res.status(200).json(pets);
  });
}