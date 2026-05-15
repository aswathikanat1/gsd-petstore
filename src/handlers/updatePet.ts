import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";

export function handleUpdatePet(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("updatePet", req, res, () => undefined, () => {
    const petData = context.request.body as Record<string, unknown>;
    
    // Extract ID from the request body (petstore.yaml defines it in the body)
    const id = (petData.id as number | undefined);
    if (id === undefined) {
      res.status(400).json(formatError("VALIDATION_ERROR", "Pet ID is required in request body"));
      return;
    }

    const pet = petRepository.update(
      id,
      petData as unknown as Parameters<typeof petRepository.update>[1]
    );
    
    if (!pet) {
      res.status(404).json(formatError("NOT_FOUND", "Pet not found", { id }));
      return;
    }

    res.status(200).json(pet);
  });
}
