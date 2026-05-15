# Pitfalls Research

## Common Pitfalls

1. Contract drift between OpenAPI and implementation.
- Warning signs: Docs examples fail in tests, clients rely on undocumented behavior.
- Prevention: Enforce contract tests in CI on every merge.
- Phase mapping: Phase 1 and Phase 4.

2. Inconsistent error semantics across endpoints.
- Warning signs: Same invalid input returns different statuses/messages.
- Prevention: Centralized error mapper and shared error schema.
- Phase mapping: Phase 1 and Phase 4.

3. Upload endpoint security and validation gaps.
- Warning signs: Missing file-type checks, oversized payload acceptance.
- Prevention: Size/type constraints and auth enforcement before file processing.
- Phase mapping: Phase 3.

4. Enum/filter handling mismatch.
- Warning signs: Unknown status values pass through silently.
- Prevention: Strict enum validation tied to OpenAPI schema.
- Phase mapping: Phase 3.
