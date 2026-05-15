# Phase 2: Core Pet Lifecycle API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 2-core-pet-lifecycle-api
**Areas discussed:** lifecycle scope, repository strategy, ID handling, response semantics, deferred phase 3 work

---

## Phase Decision Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Persistence model | In-memory repository abstraction for bootstrap CRUD vs external datastore | ✓ |
| ID strategy | Server-assigned numeric IDs with path ID authoritative for fetch/update/delete vs client-supplied IDs | ✓ |
| Write semantics | Full resource replacement for add/update vs merge patch vs form updates | ✓ |
| Error handling | Contract-compliant 400/404 responses with shared formatter vs ad hoc handler responses | ✓ |
| Delete response | Deterministic confirmation response and removal from repository vs empty response only | ✓ |
| You decide all | Delegate implementation detail choices to Claude within contract constraints | |

**Discussion outcome:** Keep phase 2 tightly focused on `POST /pet`, `PUT /pet`, `GET /pet/{petId}`, and `DELETE /pet/{petId}`.
**Notes:** Phase 3 owns status filtering, form updates, and upload behavior.

---

## Scope Notes

- Use the phase 1 Express + openapi-backend foundation as-is.
- Keep bearer-auth enforcement centralized and unchanged from the bootstrap baseline.
- Treat `petstore.yaml` as the source of truth for operation IDs, response codes, and request shapes.

## Deferred Ideas

- Status filtering by query parameter.
- Form-style updates for pet name and status.
- Binary image upload handling.

---

*Phase: 2-core-pet-lifecycle-api*
*Discussion log generated: 2026-05-15*