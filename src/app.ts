import express, { type Express } from "express";
import { type Request as OpenAPIRequest } from "openapi-backend";

import { createContractApi } from "./contract/api";
import { mountDocs } from "./docs/docsRouter";
import { formatError } from "./lib/errorFormatter";
import { type ApiErrorResponse } from "./types/error";

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

  app.use((error: unknown, _req: express.Request, res: express.Response) => {
    const details = error instanceof Error ? { message: error.message } : undefined;
    res.status(500).json(formatError("INTERNAL_ERROR", "Unexpected error", details));
  });

  return app;
}
