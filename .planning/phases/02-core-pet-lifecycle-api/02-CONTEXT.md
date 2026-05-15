# Phase 2: Core Pet Lifecycle API - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

This phase implements the core pet lifecycle operations from `petstore.yaml`: create, update, fetch by ID, and delete by ID. It does not include status filtering, form-style updates, or image upload workflows.

## Implementation Decisions

### Lifecycle Scope
- **D-01:** Reuse the Phase 1 Express + openapi-backend foundation and centralized auth/error pipeline without changing the contract-first delivery model.
- **D-02:** Anchor implementation to the `addPet`, `updatePet`, `getPetById`, and `deletePet` operation IDs from `petstore.yaml`.

### Persistence And ID Handling
- **D-03:** Model pets through a typed repository abstraction with an in-memory backing store for this phase so CRUD behavior is testable without introducing external persistence.
- **D-04:** Assign and preserve numeric IDs server-side; path IDs are authoritative for read, update, and delete operations.
- **D-05:** Treat create and update as full Pet writes, not partial merges, so request bodies map directly to the contract schema.

### Validation And Error Baseline
- **D-06:** Keep validation centralized so malformed requests fail before repository mutation and contract-specific 400/404 responses remain stable.
- **D-07:** Reuse the shared ApiErrorResponse formatter from Phase 1 for all lifecycle failures.

### Deferred Work
- Status filtering, form-style updates, and image upload remain Phase 3 concerns.
- Persistent storage is intentionally deferred until the CRUD contract is stable.

### Claude's Discretion
- Repository internals, entity normalization, and test fixture shape can be chosen during planning as long as the OpenAPI semantics stay intact.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contract And Scope
- `petstore.yaml` - source of truth for phase 2 operation IDs, paths, request bodies, and response codes.
- `.planning/PROJECT.md` - project context, constraints, and core value.
- `.planning/REQUIREMENTS.md` - requirement IDs for this phase (`PET-01`, `PET-02`, `PET-03`, `PET-04`).
- `.planning/ROADMAP.md` - phase goal, success criteria, and plan targets.

### Research Inputs
- `.planning/phases/01-foundation-and-contract-governance/01-CONTEXT.md` - inherited decisions for auth, validation, docs, and error baseline.
- `.planning/phases/01-foundation-and-contract-governance/01-RESEARCH.md` - stack guidance and contract-first implementation shape.

## Existing Code Insights

### Reusable Assets
- Phase 1 scaffold already exists and should be extended rather than replaced.
- Shared error typing and contract operation constants are already established in the foundation phase.

### Established Patterns
- Contract-first routing and centralized middleware remain the governing pattern.
- The implementation should keep business logic behind a repository or service boundary rather than inline in route handlers.

### Integration Points
- Phase 2 handlers should align to OpenAPI operation IDs and continue using the phase 1 auth and validation flow.
- Later phase 3 work depends on this lifecycle core being stable and testable.

## Specific Ideas

- Prefer a small repository/service layer that makes CRUD behavior easy to unit test.
- Keep update and delete responses deterministic so the next phase can build on predictable lifecycle semantics.

## Deferred Ideas

None beyond the explicit phase 3 scope.

---

*Phase: 2-core-pet-lifecycle-api*
*Context gathered: 2026-05-15*