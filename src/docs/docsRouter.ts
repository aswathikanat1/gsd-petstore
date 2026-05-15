import { type Express } from "express";
import path from "node:path";

import redoc from "redoc-express";

export function mountDocs(app: Express): void {
  const contractPath = path.resolve(process.cwd(), "petstore.yaml");

  app.get("/petstore.yaml", (_req, res) => {
    res.sendFile(contractPath);
  });

  app.get(
    "/api-docs",
    redoc({
      title: "Swagger Petstore API",
      specUrl: "/petstore.yaml"
    })
  );
}
