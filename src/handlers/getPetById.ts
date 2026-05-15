import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";

export function handleGetPetById(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("getPetById", req, res, () => undefined, () => {
    const petId = parseInt(context.request.params.petId as string, 10);
    const pet = petRepository.findById(petId);

    if (!pet) {
      res.status(404).json(formatError("NOT_FOUND", "Pet not found", { petId }));
      return;
    }

    res.status(200).json(pet);
  });
}
