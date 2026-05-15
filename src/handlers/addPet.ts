import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";

export function handleAddPet(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("addPet", req, res, () => undefined, () => {
    const petData = context.request.body;
    const pet = petRepository.create(
      petData as unknown as Parameters<typeof petRepository.create>[0]
    );
    res.status(200).json(pet);
  });
}
