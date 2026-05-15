---
phase: 1
plan: 01-02
subsystem: auth-and-validation
tags: [auth, middleware, validation, openapi]
requires: [01-01]
provides: [SEC-01, SEC-02]
affects: [src/middleware, src/contract, src/lib, src/handlers]
tech_stack_added: [openapi-backend-security-handlers]
key_files_created:
  - src/middleware/auth.ts
  - src/lib/errorFormatter.ts
  - src/contract/api.ts
  - src/contract/security.ts
  - src/types/express.d.ts
  - src/handlers/notFound.ts
  - src/handlers/methodNotAllowed.ts
decisions:
  - Enforced protected-operation auth through a single centralized applyOperationSecurity path.
metrics:
  duration_minutes: 34
  completed_at: 2026-05-15
---

# Phase 1 Plan 01-02: Authentication Middleware and Baseline Request Validation Summary

Implemented centralized bearer auth middleware with AUTH_STRICT mode control, OpenAPI validation/error handlers, and protected operation security mapping.

## What Was Built

- Added requireBearerAuth and isAuthStrict in auth middleware with permissive bootstrap bypass warning.
- Added Express request augmentation for auth metadata.
- Added shared formatError utility for deterministic error envelopes.
- Added OpenAPIBackend registration with validationFail, notFound, methodNotAllowed, and unauthorized handlers.
- Added protected-operation map for addPet, updatePet, deletePet, and uploadFile and centralized security application.

## Verification

- npm run build: pass.
- npm run openapi:lint: pass.

## Deviations from Plan

### Auto-fixed Issues

1. [Rule 1 - Bug] Fixed OpenAPI request typing in app dispatch path to satisfy strict TypeScript compile.

## Deferred Issues

- Functional curl-based smoke checks executed, but command-output truncation prevented capturing full response evidence in this environment.

## Self-Check: PASSED
