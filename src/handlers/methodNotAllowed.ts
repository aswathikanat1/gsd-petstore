import { type Request, type Response } from "express";

import { formatError } from "../lib/errorFormatter";

export function handleMethodNotAllowed(req: Request, res: Response): void {
  res.status(405).json(
    formatError("METHOD_NOT_ALLOWED", "Method not allowed", {
      method: req.method,
      path: req.path
    })
  );
}
