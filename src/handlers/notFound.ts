import { type Request, type Response } from "express";

import { formatError } from "../lib/errorFormatter";

export function handleNotFound(_req: Request, res: Response): void {
  res.status(404).json(formatError("NOT_FOUND", "Route not found"));
}
