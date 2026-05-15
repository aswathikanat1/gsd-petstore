import { type Request, type Response } from "express";
import { OpenAPIBackend } from "openapi-backend";

import { handleAddPet } from "../handlers/addPet";
import { handleDeletePet } from "../handlers/deletePet";
import { handleFindPetsByStatus } from "../handlers/findPetsByStatus";
import { handleGetPetById } from "../handlers/getPetById";
import { handleMethodNotAllowed } from "../handlers/methodNotAllowed";
import { handleNotFound } from "../handlers/notFound";
import { handleUpdatePetWithForm } from "../handlers/updatePetWithForm";
import { handleUpdatePet } from "../handlers/updatePet";
import { handleUploadFile } from "../handlers/uploadFile";
import { formatError } from "../lib/errorFormatter";
import { registerSecurityHandlers } from "./security";

export function createContractApi(): OpenAPIBackend {
  const api = new OpenAPIBackend({ definition: "./petstore.yaml" });

  api.register({
    validationFail: (context, _req, res) => {
      res
        .status(400)
        .json(
          formatError(
            "VALIDATION_ERROR",
            "Request validation failed",
            context.validation.errors
          )
        );
    },
    notFound: (_context, req, res) => {
      handleNotFound(req as Request, res as Response);
    },
    methodNotAllowed: (_context, req, res) => {
      handleMethodNotAllowed(req as Request, res as Response);
    },
    unauthorizedHandler: (context, _req, res) => {
      const operationId = context.operation?.operationId ?? "unknown";
      res
        .status(401)
        .json(formatError("UNAUTHORIZED", "Bearer token required", { operationId }));
    },
    addPet: handleAddPet,
    updatePet: handleUpdatePet,
    findPetsByStatus: handleFindPetsByStatus,
    getPetById: handleGetPetById,
    updatePetWithForm: handleUpdatePetWithForm,
    deletePet: handleDeletePet,
    uploadFile: handleUploadFile
  });

  registerSecurityHandlers(api);

  return api;
}
