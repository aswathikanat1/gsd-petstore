import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";
import { type PetStatus } from "../types/pet";

const ALLOWED_STATUSES = new Set<PetStatus>(["available", "pending", "sold"]);

export function handleUpdatePetWithForm(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("updatePetWithForm", req, res, () => undefined, () => {
    const petIdRaw = context.request.params.petId;
    const petId = Number(petIdRaw);

    if (!Number.isInteger(petId)) {
      res.status(400).json(formatError("VALIDATION_ERROR", "Invalid input", { petId: petIdRaw }));
      return;
    }

    const name = context.request.query.name;
    const status = context.request.query.status;
    const nameValue = typeof name === "string" ? name : undefined;
    const statusValue = typeof status === "string" ? status : undefined;

    if (nameValue === undefined && statusValue === undefined) {
      res.status(400).json(formatError("VALIDATION_ERROR", "Invalid input"));
      return;
    }

    if (statusValue !== undefined && !ALLOWED_STATUSES.has(statusValue as PetStatus)) {
      res
        .status(400)
        .json(formatError("VALIDATION_ERROR", "Invalid input", { status: statusValue }));
      return;
    }

    const updated = petRepository.partialUpdate(petId, {
      ...(nameValue !== undefined ? { name: nameValue } : {}),
      ...(statusValue !== undefined ? { status: statusValue as PetStatus } : {})
    });

    if (!updated) {
      res.status(404).json(formatError("NOT_FOUND", "Pet not found", { petId }));
      return;
    }

    res.status(200).json(updated);
  });
}