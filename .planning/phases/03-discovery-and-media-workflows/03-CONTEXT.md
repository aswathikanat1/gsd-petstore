# Phase 3: Discovery And Media Workflows - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

This phase implements the remaining user-facing API operations: status-based pet discovery, form-style pet updates, and binary image uploads. It does not include persistent storage, advanced query operators, or rate limiting.

## Implementation Decisions

### Discovery And Filtering Scope
- **D-01:** Implement findPetsByStatus to filter pets in the in-memory repository by enum-constrained status values.
- **D-02:** Validate status query parameters against the enum (available, pending, sold) and return 400 for invalid values.
- **D-03:** Return a JSON array of matching pets or an empty array for valid status values with no matches.

### Form-Style Update Compatibility
- **D-04:** Implement updatePetWithForm as a partial merge operation using optional query parameters for name and status.
- **D-05:** Preserve existing pet fields not explicitly updated in the form request.
- **D-06:** Maintain backward compatibility with the JSON full-replacement updates from phase 2.

### Binary File Upload Handling
- **D-07:** Implement uploadFile to accept binary file streams and store metadata references in the in-memory repository.
- **D-08:** Return ApiResponse (per petstore.yaml) with code, type, and message fields on successful upload.
- **D-09:** Return contract-compliant 400 for missing file and 404 for non-existent pet IDs.

### Error Handling Baseline
- **D-10:** Reuse the shared ApiErrorResponse formatter from Phase 1 for all status/form/upload failures.
- **D-11:** Keep error responses deterministic and contract-aligned across all three operations.

### Deferred Work
- Persistent file storage and S3/disk integration remain deferred.
- Rate limiting and upload size validation remain deferred to phase 4+ hardening.

### Claude's Discretion
- File metadata storage structure and upload handling internals can be chosen during planning as long as OpenAPI semantics stay intact.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contract And Scope
- `petstore.yaml` - source of truth for findPetsByStatus, updatePetWithForm, uploadFile operation IDs, paths, parameters, and response codes.
- `.planning/PROJECT.md` - project context, constraints, and core value.
- `.planning/REQUIREMENTS.md` - requirement IDs for this phase (`PET-05`, `DISC-01`, `DISC-02`, `MEDIA-01`, `MEDIA-02`).
- `.planning/ROADMAP.md` - phase goal, success criteria, and plan targets.

### Research Inputs
- `.planning/phases/01-foundation-and-contract-governance/01-CONTEXT.md` - inherited decisions for auth, validation, docs, and error baseline.
- `.planning/phases/02-core-pet-lifecycle-api/02-CONTEXT.md` - inherited decisions for repository pattern and CRUD semantics.
- `.planning/phases/02-core-pet-lifecycle-api/02-03-SUMMARY.md` - test patterns established for phase 2 lifecycle tests.

## Existing Code Insights

### Reusable Assets
- Phase 1 and 2 scaffold and handlers already exist and should be extended rather than replaced.
- Shared error typing, repository pattern, and handler structure are established.
- In-memory repository supports filtering operations without refactoring.

### Established Patterns
- Contract-first routing and centralized middleware remain the governing pattern.
- Handlers delegate to the repository boundary and use shared error formatting.
- Test patterns from phase 2 can be extended for phase 3 coverage.

### Integration Points
- Phase 3 handlers should align to OpenAPI operation IDs and continue using phase 1 auth and validation flow.
- Phase 3 work completes the v1 feature set; phase 4 focuses on hardening and testing.

## Specific Ideas

- Status filtering can reuse the repository boundary with a filter method on the existing Map-based store.
- Form updates can leverage the same repository update method used by JSON updates, applying optional fields selectively.
- File uploads can store metadata in the pet record without actual file persistence for this phase.

## Deferred Ideas

None beyond the explicit phase 4+ scope.

---

*Phase: 3-discovery-and-media-workflows*
*Context gathered: 2026-05-15*
