import { type Request, type Response } from "express";
import { type Context } from "openapi-backend";

import { applyOperationSecurity } from "../contract/security";
import { formatError } from "../lib/errorFormatter";
import { petRepository } from "../repositories/petRepository";

function getPayloadSize(payload: unknown): number {
  if (Buffer.isBuffer(payload)) {
    return payload.length;
  }

  if (typeof payload === "string") {
    return Buffer.byteLength(payload);
  }

  if (payload === null || payload === undefined) {
    return 0;
  }

  return Buffer.byteLength(JSON.stringify(payload));
}

export function handleUploadFile(context: Context, req: Request, res: Response): void {
  applyOperationSecurity("uploadFile", req, res, () => undefined, () => {
    const petIdRaw = context.request.params.petId;
    const petId = Number(petIdRaw);
    const payload = context.request.requestBody;

    if (!Number.isInteger(petId)) {
      res.status(400).json(formatError("VALIDATION_ERROR", "Invalid pet value", { petId: petIdRaw }));
      return;
    }

    if (payload === undefined || payload === null || getPayloadSize(payload) === 0) {
      res.status(400).json(formatError("NO_FILE", "No file uploaded"));
      return;
    }

    const additionalMetadata =
      typeof context.request.query.additionalMetadata === "string"
        ? context.request.query.additionalMetadata
        : undefined;

    const contentType = req.header("content-type") ?? "application/octet-stream";

    const updated = petRepository.attachUploadMetadata(petId, {
      contentType,
      size: getPayloadSize(payload),
      additionalMetadata,
      uploadedAt: new Date().toISOString()
    });

    if (!updated) {
      res.status(404).json(formatError("NOT_FOUND", "Pet not found", { petId }));
      return;
    }

    res.status(200).json({
      code: 200,
      type: "success",
      message: "File uploaded successfully"
    });
  });
}