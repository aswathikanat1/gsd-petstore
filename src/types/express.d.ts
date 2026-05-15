import "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        authorized: boolean;
        reason?: "missing_or_invalid" | "present";
        mode: "strict" | "permissive";
      };
    }
  }
}

export {};
