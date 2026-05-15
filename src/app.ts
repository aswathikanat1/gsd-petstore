import express, { type Express } from "express";
import { type Request as OpenAPIRequest } from "openapi-backend";

import { createContractApi } from "./contract/api";
import { mountDocs } from "./docs/docsRouter";
import { formatInternalError } from "./lib/errorFormatter";
import { type ApiErrorResponse } from "./types/error";

function toSafeErrorDetails(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message
  };
}

export function handleGlobalError(
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  const details = toSafeErrorDetails(error);
  res.status(500).json(formatInternalError(details));
}

export function createApp(): Express {
  const app = express();
  type ErrorPayload = ApiErrorResponse;
  const api = createContractApi();
  const apiInitPromise = api.init();

  app.use(express.json());
  mountDocs(app);

  app.get("/health", (_req, res) => {
    const payload: ErrorPayload | { status: string } = { status: "ok" };
    res.status(200).json(payload);
  });

  app.use(async (req, res, next) => {
    try {
      await apiInitPromise;
      await api.handleRequest(req as unknown as OpenAPIRequest, req, res);
    } catch (error) {
      next(error);
    }
  });

  app.use(handleGlobalError);

  return app;
}
