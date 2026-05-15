import { type Request, type Response } from "express";
import { OpenAPIBackend, type Context } from "openapi-backend";

import { handleMethodNotAllowed } from "../handlers/methodNotAllowed";
import { handleNotFound } from "../handlers/notFound";
import { formatError } from "../lib/errorFormatter";
import { applyOperationSecurity, registerSecurityHandlers } from "./security";

function createNotImplementedHandler(operationId: string) {
  return (_context: Context, req: Request, res: Response): void => {
    applyOperationSecurity(operationId, req, res, () => undefined, () => {
      res.status(501).json(
        formatError("NOT_IMPLEMENTED", "Operation not implemented yet", {
          operationId
        })
      );
    });
  };
}

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
    addPet: createNotImplementedHandler("addPet"),
    updatePet: createNotImplementedHandler("updatePet"),
    findPetsByStatus: createNotImplementedHandler("findPetsByStatus"),
    getPetById: createNotImplementedHandler("getPetById"),
    updatePetWithForm: createNotImplementedHandler("updatePetWithForm"),
    deletePet: createNotImplementedHandler("deletePet"),
    uploadFile: createNotImplementedHandler("uploadFile")
  });

  registerSecurityHandlers(api);

  return api;
}
