import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";

export function handleDeletePet(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("deletePet", req, res, () => undefined, () => {
    const petId = parseInt(context.request.params.petId as string, 10);
    
    // Verify the pet exists before deleting
    const pet = petRepository.findById(petId);
    if (!pet) {
      res.status(404).json(formatError("NOT_FOUND", "Pet not found", { petId }));
      return;
    }

    petRepository.delete(petId);
    res.status(200).json({ message: "Pet deleted" });
  });
}
