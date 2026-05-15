# Phase 1: Foundation And Contract Governance - Research

**Researched:** 2026-05-15
**Domain:** Contract-first TypeScript Node.js API foundation (auth, validation, docs, CI governance)
**Confidence:** MEDIUM

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a TypeScript-first Node.js service foundation for phase implementation planning.
- **D-02:** Favor a minimal bootstrap with fast iteration setup, then tighten conventions in later plans.
- **D-03:** Implement bearer-token middleware and protected-route policy in bootstrap mode first, then harden strict rejection behavior in subsequent phases.
- **D-04:** Keep auth handling centralized (single middleware path) to avoid route-by-route drift.
- **D-05:** Start with permissive bootstrap validation behavior where practical, but preserve contract response-code intent.
- **D-06:** Establish one shared error-response formatter early so later phases inherit consistent patterns.
- **D-07:** Generate API docs directly from `petstore.yaml`; no manual doc authoring as source of truth.
- **D-08:** Add merge-gate automation for spec validation and documentation freshness as part of this phase's CI setup.

### Claude's Discretion
- Runtime framework selection details (Fastify vs Express) can be chosen during planning based on implementation ergonomics.
- Exact CI tool choice can be chosen during planning as long as contract validation and docs generation are enforced.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Protected operations require bearer authorization as declared by the OpenAPI security scheme. | Use OpenAPI-defined security scheme Authorization with centralized bearer middleware plus openapi-backend security handler and unauthorized handler mapping. [CITED: https://openapistack.co/docs/openapi-backend/intro/] [CITED: https://github.com/openapistack/openapi-backend] |
| SEC-02 | Validation failures return stable HTTP status codes and response patterns for client handling. | Use single error formatter and validation fail handler with fixed status mapping (400/401/404/422) and deterministic error envelope. [CITED: https://github.com/openapistack/openapi-backend] [CITED: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/] |
| OPS-01 | Team can generate and publish API reference documentation directly from the OpenAPI file. | Use petstore.yaml as source and generate docs via redocly build-docs + serve interactive docs with swagger-ui-express. [CITED: https://redocly.com/docs/cli/commands/build-docs] [CITED: https://github.com/scottie1984/swagger-ui-express] |

## Summary

Phase 1 should use a contract-first runtime path where request routing, auth intent, and validation behavior are all derived from `petstore.yaml`, not duplicated in framework-only schemas. This minimizes contract drift and aligns directly to SEC-01/SEC-02/OPS-01. [CITED: https://openapistack.co/docs/openapi-backend/intro/] [CITED: https://github.com/openapistack/openapi-backend]

For the framework decision requested, Express + openapi-backend is the better fit than Fastify + @fastify/swagger for this specific phase objective. Fastify + @fastify/swagger is excellent when your source of truth is route schemas (dynamic mode) or you only need to serve a static spec, but openapi-backend gives direct operationId routing, validation hooks, and security handlers tied to the existing OpenAPI file, plus a cleaner permissive-to-strict migration control point. [CITED: https://github.com/fastify/fastify-swagger] [CITED: https://openapistack.co/docs/openapi-backend/intro/]

Use Redocly CLI as the merge-gate contract validator plus static docs generator, and optionally add Spectral later for style governance. [CITED: https://redocly.com/docs/cli/commands/lint] [CITED: https://redocly.com/docs/cli/commands/build-docs] [CITED: https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview]

**Primary recommendation:** Implement Phase 1 with Express + openapi-backend, centralized bearer middleware + security handler bridge, shared error formatter, and Redocly-driven CI/docs automation from `petstore.yaml`. [CITED: https://expressjs.com/en/starter/installing.html] [CITED: https://openapistack.co/docs/openapi-backend/intro/] [CITED: https://redocly.com/docs/cli/commands/lint]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| OpenAPI contract parsing/routing | API / Backend | -- | Request-to-operation resolution and handler dispatch belong in server runtime. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| Bearer token extraction and auth decision | API / Backend | Frontend Server (SSR) | Security enforcement for protected operations must happen server-side; SSR may forward tokens only. [CITED: https://github.com/openapistack/openapi-backend] |
| Request/response validation | API / Backend | -- | Contract validation is an API boundary concern and should run before business logic. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| Error contract formatting | API / Backend | -- | Stable status + error shape must be enforced centrally for all operations. [ASSUMED] |
| API reference docs generation | API / Backend | CDN / Static | Docs are generated from OpenAPI and then served as static artifact/UI. [CITED: https://redocly.com/docs/cli/commands/build-docs] |
| Merge-gate spec governance | API / Backend | CI platform | Contract lint and docs freshness checks are CI enforcement responsibilities. [CITED: https://redocly.com/docs/cli/commands/lint] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | 5.2.1 | HTTP app framework | Minimal bootstrap footprint and straightforward middleware pipeline for centralized auth/error control. [CITED: https://expressjs.com/en/starter/installing.html] [ASSUMED] |
| openapi-backend | 5.16.1 | Contract-first routing, request validation hooks, security handler mapping | Directly maps operationIds/security schemes from OpenAPI and supports framework-agnostic handlers. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| typescript | 6.0.3 | Type-safe service code | Type safety for handler contracts and middleware interfaces in bootstrap phase. [ASSUMED] |
| tsx | 4.22.0 | Fast TypeScript execution in dev | Simplifies startup and dev scripts without complex compile wiring. [ASSUMED] |
| jsonwebtoken | 9.0.3 | JWT signature and claims verification | Stable token verification primitive for custom middleware or security handlers. [ASSUMED] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| swagger-ui-express | 5.0.1 | Interactive API docs endpoint from parsed OpenAPI doc | Use for local/dev and in-service docs viewing at /api-docs. [CITED: https://github.com/scottie1984/swagger-ui-express] |
| @redocly/cli | 2.30.6 | OpenAPI linting and static docs generation | Use in CI merge gates and docs publish steps. [CITED: https://redocly.com/docs/cli/commands/lint] [CITED: https://redocly.com/docs/cli/commands/build-docs] |
| @stoplight/spectral-cli | 6.16.0 | API style linting and custom governance rules | Add when governance needs exceed structural/spec linting. [CITED: https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| express + openapi-backend | fastify + @fastify/swagger + @fastify/swagger-ui | Fastify stack is excellent for schema-first route definitions and high performance, but contract-first from existing `petstore.yaml` is less direct unless you add additional glue or duplicate schemas. [CITED: https://github.com/fastify/fastify-swagger] [CITED: https://github.com/openapistack/openapi-backend] |
| custom JWT middleware | express-jwt | express-jwt is production-capable and has credentialsRequired=false for permissive mode, but custom middleware gives finer control over bootstrap-to-strict transitions and uniform error envelopes. [CITED: https://github.com/auth0/express-jwt] [ASSUMED] |
| Redocly-only linting | Spectral-only linting | Spectral is strong for style governance; Redocly is stronger for integrated OpenAPI lifecycle (lint + docs build) in one CLI path for this phase. [CITED: https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview] [CITED: https://redocly.com/docs/cli/commands/lint] |

**Installation:**

```bash
npm install express openapi-backend jsonwebtoken swagger-ui-express
npm install -D typescript tsx @types/node @types/express @redocly/cli @stoplight/spectral-cli
```

**Version verification:**

```bash
npm.cmd view express version
npm.cmd view openapi-backend version
npm.cmd view @redocly/cli version
```

Verified npm registry metadata from this session:
- express 5.2.1 published 2025-12-01T20:49:43.268Z. [VERIFIED: npm registry]
- openapi-backend 5.16.1 published 2026-02-22T14:02:44.709Z. [VERIFIED: npm registry]
- express-openapi-validator 5.6.2 published 2026-01-20T01:08:03.949Z. [VERIFIED: npm registry]
- express-jwt 8.5.1 published 2024-12-09T17:36:06.557Z. [VERIFIED: npm registry]
- jsonwebtoken 9.0.3 published 2025-12-04T10:27:57.257Z. [VERIFIED: npm registry]
- swagger-ui-express 5.0.1 published 2024-05-31T21:16:32.005Z. [VERIFIED: npm registry]
- redoc 2.5.2 published 2025-10-15T08:32:47.813Z. [VERIFIED: npm registry]
- @redocly/cli 2.30.6 published 2026-05-14T13:39:48.242Z. [VERIFIED: npm registry]
- @stoplight/spectral-cli 6.16.0 published 2026-05-12T14:58:25.064Z. [VERIFIED: npm registry]
- fastify 5.8.5 published 2026-04-14T12:07:12.232Z. [VERIFIED: npm registry]
- @fastify/swagger 9.7.0 published 2026-02-07T11:12:05.976Z. [VERIFIED: npm registry]
- @fastify/swagger-ui 5.2.6 published 2026-04-21T09:26:30.193Z. [VERIFIED: npm registry]
- typescript 6.0.3 published 2026-04-16T23:38:27.905Z. [VERIFIED: npm registry]
- tsx 4.22.0 published 2026-05-14T14:04:37.011Z. [VERIFIED: npm registry]

Postinstall script check (npm view scripts.postinstall): none detected for listed packages in this session. [VERIFIED: npm registry]

## Package Legitimacy Audit

> Required whenever this phase installs external packages.

slopcheck protocol was attempted, but local slopcheck invocation in this environment validated against PyPI package names and produced ecosystem-mismatch false positives for npm packages. Treating slopcheck as unavailable for npm package legitimacy in this run. [VERIFIED: npm registry]

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| express | npm | Mature | High (not measured in this run) | https://github.com/expressjs/express | ASSUMED (tool mismatch) | Approved with human verify |
| openapi-backend | npm | Mature | Medium (not measured in this run) | https://github.com/openapistack/openapi-backend | ASSUMED (tool mismatch) | Approved with human verify |
| jsonwebtoken | npm | Mature | High (not measured in this run) | https://github.com/auth0/node-jsonwebtoken | ASSUMED (tool mismatch) | Approved with human verify |
| swagger-ui-express | npm | Mature | Medium (not measured in this run) | https://github.com/scottie1984/swagger-ui-express | ASSUMED (tool mismatch) | Approved with human verify |
| @redocly/cli | npm | Mature | Medium (not measured in this run) | https://github.com/Redocly/redocly-cli | ASSUMED (tool mismatch) | Approved with human verify |
| @stoplight/spectral-cli | npm | Mature | Medium (not measured in this run) | https://github.com/stoplightio/spectral | ASSUMED (tool mismatch) | Approved with human verify |
| typescript | npm | Mature | Very high (not measured in this run) | https://github.com/microsoft/TypeScript | ASSUMED (tool mismatch) | Approved with human verify |
| tsx | npm | Mature | Medium (not measured in this run) | https://github.com/privatenumber/tsx | ASSUMED (tool mismatch) | Approved with human verify |

**Packages removed due to slopcheck [SLOP] verdict:** none (SLOP results were cross-ecosystem false positives from PyPI check).
**Packages flagged as suspicious [SUS]:** redoc in PyPI-mode scan (not part of recommended npm install path).

## Architecture Patterns

### System Architecture Diagram

```text
Client/Caller
   |
   v
Express App Entry
   |
   v
Central Bearer Middleware (bootstrap strictness flag)
   |
   v
OpenAPIBackend Request Dispatcher
   |--> Match operationId from petstore.yaml
   |--> Validate request params/query/body (per operation)
   |--> Execute security handler for Authorization scheme
   |
   +--> validationFail / unauthorizedHandler / notFound
   |         |
   v         v
Operation Handler ---------> Shared Error Formatter ---------> HTTP Response
   |
   +--> (optional postResponse validation in strict mode)

CI Pipeline
   |
   +--> redocly lint petstore.yaml
   +--> redocly build-docs petstore.yaml -> docs artifact
   +--> docs freshness check (git diff)
```

### Recommended Project Structure

```text
src/
├── app/                  # express bootstrap, middleware wiring
├── contract/             # openapi-backend initialization and handlers
├── auth/                 # bearer parsing and token verification utilities
├── errors/               # shared error formatter and error classes
├── routes/               # operation handlers (operationId-aligned)
└── config/               # env and mode flags (permissive/strict)
```

### Pattern 1: Contract-First Operation Dispatch
**What:** Route all API requests through openapi-backend with operationId handlers and centralized validation/auth hooks.
**When to use:** Existing OpenAPI file is source of truth and implementation must follow it exactly.
**Example:**

```typescript
// Source: https://openapistack.co/docs/openapi-backend/intro/
import OpenAPIBackend from 'openapi-backend';

const api = new OpenAPIBackend({ definition: './petstore.yaml' });

api.register({
  validationFail: (c, req, res) => res.status(400).json({ error: c.validation.errors }),
  unauthorizedHandler: (c, req, res) => res.status(401).json({ error: 'unauthorized' }),
  notFound: (c, req, res) => res.status(404).json({ error: 'not found' }),
});

api.registerSecurityHandler('Authorization', (c) => {
  // return truthy only when bearer token is accepted
  return true;
});

api.init();
```

### Pattern 2: Permissive-To-Strict Auth Mode Flag
**What:** Keep one middleware path but toggle enforcement behavior with explicit bootstrap mode.
**When to use:** Early scaffolding phase where routes must be wired before full auth hardening.
**Example:**

```typescript
// Source: https://github.com/auth0/express-jwt (credentialsRequired pattern inspiration)
function bearerBootstrapGuard(permissive: boolean) {
  return (req: any, _res: any, next: any) => {
    const header = req.headers?.authorization;
    if (!header) {
      req.authContext = { tokenPresent: false, mode: permissive ? 'permissive' : 'strict' };
      return next();
    }
    req.authContext = { tokenPresent: true, raw: header };
    return next();
  };
}
```

### Anti-Patterns to Avoid
- **Dual source of truth:** Defining route schemas in code that diverge from `petstore.yaml`.
- **Route-level auth scatter:** Per-route custom checks that bypass centralized middleware/security handlers.
- **Unstable validation responses:** Returning different shapes/statuses for the same validation class.
- **Docs-by-hand:** Editing markdown docs manually instead of generating from OpenAPI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OpenAPI operation routing | Custom path+method matcher | openapi-backend operationId dispatcher | Avoids drift and supports spec-driven handler mapping/security hooks. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| Spec linting rules engine | Homegrown YAML validators | @redocly/cli lint and optional Spectral rulesets | Standards evolve; mature rulesets reduce hidden compliance gaps. [CITED: https://redocly.com/docs/cli/commands/lint] [CITED: https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview] |
| Interactive API docs UI plumbing | Custom static pages | swagger-ui-express for runtime docs | Fast integration with Express and OpenAPI document payload. [CITED: https://github.com/scottie1984/swagger-ui-express] |
| JWT verification cryptography | Manual token parsing/signature logic | jsonwebtoken (or express-jwt wrapper) | Cryptography/auth edge-cases are easy to get wrong. [ASSUMED] |

**Key insight:** The highest risk in this phase is governance drift, not route coding speed. Use tooling that keeps contract/auth/docs tied to the same OpenAPI artifact. [CITED: https://openapistack.co/docs/openapi-backend/intro/] [CITED: https://redocly.com/docs/cli/commands/lint]

## Common Pitfalls

### Pitfall 1: Contract Drift Between Spec And Runtime
**What goes wrong:** Implemented behavior no longer matches `petstore.yaml` statuses/security expectations.
**Why it happens:** Separate route validation/auth logic maintained outside contract-driven dispatcher.
**How to avoid:** Route through openapi-backend and keep merge gate lint/docs checks mandatory.
**Warning signs:** Frequent manual exceptions in handlers for schema/security mismatches.

### Pitfall 2: Permissive Mode Never Hardens
**What goes wrong:** Bootstrap bypass remains in production-like environments.
**Why it happens:** No explicit mode flag strategy or acceptance criteria for strict transition.
**How to avoid:** Add explicit config toggle and CI checks asserting strict mode in protected environments.
**Warning signs:** Missing token accepted for SEC-01 protected operations after phase gate.

### Pitfall 3: Error Envelope Fragmentation
**What goes wrong:** Validation/auth/not-found errors return different structures, breaking client handling (SEC-02).
**Why it happens:** Error shaping done in each route/middleware independently.
**How to avoid:** Single shared error formatter invoked by validationFail, unauthorizedHandler, notFound, and global error handler.
**Warning signs:** Frontend/client needs per-endpoint error parsing conditions.

### Pitfall 4: CI Validates Spec But Not Docs Freshness
**What goes wrong:** Published docs lag behind contract updates.
**Why it happens:** Lint stage exists, but docs artifact freshness is not checked in merge gate.
**How to avoid:** Generate docs in CI and fail if regenerated artifact differs from committed output.
**Warning signs:** Docs PRs frequently require manual follow-up commits.

## Code Examples

Verified patterns from official sources:

### OpenAPI Security Handler (SEC-01 foundation)

```typescript
// Source: https://github.com/openapistack/openapi-backend
api.registerSecurityHandler('Authorization', (c) => {
  const header = c.request.headers?.authorization;
  if (!header) return false;
  // verify bearer here
  return true;
});

api.register('unauthorizedHandler', (_c, _req, res) => {
  return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Bearer token required or invalid' });
});
```

### Stable Validation Failure Envelope (SEC-02 foundation)

```typescript
// Source: https://openapistack.co/docs/openapi-backend/intro/
api.register('validationFail', (c, _req, res) => {
  return res.status(400).json({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: c.validation.errors,
  });
});
```

### Docs Generation And CI Gate (OPS-01 foundation)

```bash
# Source: https://redocly.com/docs/cli/commands/lint
npx @redocly/cli lint petstore.yaml --format=github-actions

# Source: https://redocly.com/docs/cli/commands/build-docs
npx @redocly/cli build-docs petstore.yaml --output docs/api-reference.html

# freshness check in CI step
git diff --exit-code docs/api-reference.html
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual route validation per endpoint | OpenAPI-driven runtime validation and operation dispatch | Ongoing ecosystem shift (OpenAPI tooling maturity) | Better consistency and lower drift risk. [ASSUMED] |
| Manual markdown API docs | Generated docs from contract artifact | Ongoing docs-as-code adoption | Reliable docs freshness and less manual toil. [ASSUMED] |
| Framework-centric auth scattered in routes | Centralized middleware + security handler mapping to OpenAPI security schemes | Current best practice for governance-driven APIs | Cleaner SEC-01 enforcement and easier hardening path. [ASSUMED] |

**Deprecated/outdated:**
- Hand-maintained docs pages as source of truth: replaced by contract-generated docs workflows. [ASSUMED]
- Per-route custom validation without contract gate: replaced by centralized OpenAPI validation in mature API teams. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Bare npm init + targeted tooling is better than Nx for this single-service phase. | Standard Stack / scaffold strategy | Could underinvest in workspace tooling if project scope rapidly expands. |
| A2 | Custom bearer middleware over express-jwt provides cleaner permissive-to-strict migration for this team. | Alternatives / Auth pattern | Team may prefer standardized middleware semantics over flexibility. |
| A3 | Common error envelope format should include code/message/details keys. | SEC-02 error formatter pattern | Minor contract mismatch if client expects different envelope field names. |
| A4 | CI docs freshness should be enforced via committed generated artifact diff. | CI governance pattern | If team prefers artifact-only publish, this check may be too strict/noisy. |

## Open Questions (RESOLVED)

1. Should strict auth enforcement be activated by environment (for example, non-dev) or by explicit phase flag?
  - Resolution: Use explicit runtime flag via `AUTH_STRICT` only for Phase 1 (`AUTH_STRICT=false` bootstrap permissive mode, strict otherwise) so behavior is deterministic and environment-agnostic.

2. Should docs artifact be committed in-repo or generated at publish time only?
  - Resolution: Generate docs in CI and local via `docs:generate`, but do not require committed generated artifact in repository for this phase; gate is command success + lint, not checked-in HTML diff.

3. Should SEC-02 validation status default to 400 only, or reserve 422 for semantic contract violations?
  - Resolution: Use 400 for baseline validationFail in Phase 1, keep 422 reserved for later semantic/business validation phases where explicit domain rules are introduced.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | TypeScript runtime/tooling | yes | v25.6.0 | -- |
| npm.cmd | Package install and scripts | yes | 11.8.0 | npx.cmd for one-off CLI execution |
| npx.cmd | Running Redocly/Spectral without global install | yes | 11.8.0 | local devDependency binaries |
| py launcher | Optional helper tools (slopcheck attempted) | yes | 3.13.3 | -- |
| redocly CLI (global) | CI lint/docs if global expected | no | -- | use npx @redocly/cli |
| spectral CLI (global) | style linting if global expected | no | -- | use npx @stoplight/spectral-cli |
| git | docs freshness diff checks in local shell | no (in this subagent shell context) | -- | run gate in CI runner with git available |

**Missing dependencies with no fallback:**
- none for this phase (CI can provide git and node toolchain).

**Missing dependencies with fallback:**
- redocly global CLI (fallback npx/local devDependency).
- spectral global CLI (fallback npx/local devDependency).
- git in current shell context (fallback CI enforcement).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Bearer token verification through centralized middleware + security handler. [CITED: https://github.com/openapistack/openapi-backend] |
| V3 Session Management | no | Stateless bearer model for this phase scope. [ASSUMED] |
| V4 Access Control | yes | Enforce protected operations via OpenAPI security scheme mapping. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| V5 Input Validation | yes | OpenAPI schema-driven request validation with stable error mapping. [CITED: https://openapistack.co/docs/openapi-backend/intro/] |
| V6 Cryptography | yes | Use established JWT verification library, no custom crypto primitives. [ASSUMED] |

### Known Threat Patterns for TypeScript + Node Contract-First API

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Missing or bypassed bearer checks on protected routes | Elevation of Privilege | Central middleware and OpenAPI security handler enforcement with deny-by-default unauthorized handler. |
| Schema bypass through permissive parser/content-type mismatch | Tampering | Validate request payloads from OpenAPI-driven dispatcher and restrict accepted content types per operation. |
| Error detail leakage (schema internals/tokens) | Information Disclosure | Shared error formatter that redacts sensitive internals while preserving stable client-facing structure. |
| Spec drift causing undocumented attack surface | Tampering | Merge-gate linting and generated docs freshness check tied to `petstore.yaml`. |

## Sources

### Primary (HIGH confidence)
- https://openapistack.co/docs/openapi-backend/intro/ - OpenAPIBackend features, validation, security handler model.
- https://github.com/openapistack/openapi-backend - operationId routing, validationFail, unauthorizedHandler, examples.
- https://github.com/fastify/fastify-swagger - dynamic vs static modes and static OpenAPI serving behavior.
- https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/ - Fastify validation/error behavior.
- https://redocly.com/docs/cli/commands/lint - lint command usage for CI governance.
- https://redocly.com/docs/cli/commands/build-docs - docs generation command and output behavior.
- https://github.com/scottie1984/swagger-ui-express - Express docs UI middleware usage.
- https://github.com/auth0/express-jwt - credentialsRequired and JWT middleware options.
- npm registry metadata via npm.cmd view for all candidate packages (versions, publish dates, postinstall checks).

### Secondary (MEDIUM confidence)
- https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview - Spectral usage and linting model.
- https://nx.dev/docs/getting-started/intro - Nx positioning and monorepo focus.
- https://expressjs.com/en/starter/installing.html - baseline Express bootstrap steps.

### Tertiary (LOW confidence)
- Scaffold tradeoff weighting (bare npm init vs Nx vs fastify-cli) for this project context. [ASSUMED]
- Recommended default error envelope field names (code/message/details). [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - core framework/tooling recommendation is strongly cited, but package legitimacy gate had slopcheck ecosystem mismatch.
- Architecture: HIGH - directly grounded in OpenAPIBackend + Express/Fastify docs and locked project constraints.
- Pitfalls: MEDIUM - partly documented by tools, partly experience-based assumptions.

**Research date:** 2026-05-15
**Valid until:** 2026-06-14
