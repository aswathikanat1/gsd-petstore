---
phase: 2
plan: 02-02
subsystem: pet-lifecycle-mutations
tags: [typescript, express, openapi, crud, mutations]
requires: [02-01]
provides: [PET-02-update, PET-04-delete]
affects: [src/handlers, src/contract, src/repositories]
tech_stack_added: []
key_files_created:
  - src/handlers/updatePet.ts
  - src/handlers/deletePet.ts
decisions:
  - UpdatePet performs full resource replacement using ID from request body.
  - DeletePet removes records and returns deterministic confirmation response.
metrics:
  duration_minutes: 10
  completed_at: 2026-05-15
---

# Phase 2 Plan 02-02: Update and Delete Handlers with Contract-Compliant Responses Summary

Extended the phase 2 repository and handler layer to support full pet replacement updates and deterministic deletions, preserving OpenAPI response semantics and the shared error envelope behavior.

## What Was Built

- Added handleUpdatePet handler that replaces stored pet by ID and returns updated payload or 404.
- Added handleDeletePet handler that removes pet by ID and returns deterministic success response.
- Both handlers delegate missing-record and validation-adjacent failures through shared formatError.
- Updated contract/api.ts to wire updatePet and deletePet handlers into the OpenAPI dispatcher.

## Verification

- npm run build: pass (no TypeScript errors).
- Update operation replaces existing pet and returns contract-aligned payload.
- Delete operation removes pet from repository and returns success response.
- Missing IDs in both handlers surface contract-compliant 404 responses.
- No ad hoc error envelope shapes introduced; all errors flow through shared formatter.

## Deviations from Plan

None - plan executed as specified.

## Known Stubs

- test/petLifecycle.test.ts written in plan 02-03 but not yet integrated into test runner CI.

## Self-Check: PASSED
