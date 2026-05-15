# Stack Research

## Recommended Stack (2026)

- Runtime: Node.js 22 LTS
- Language: TypeScript 5.x
- Framework: Fastify 5.x (or Express 5 if ecosystem lock-in exists)
- Validation: OpenAPI-driven validation (Ajv under framework integration)
- Testing: Vitest + supertest or Fastify inject
- Contract Testing: Schemathesis or Dredd against `petstore.yaml`
- Docs: Swagger UI/ReDoc generated directly from source spec
- Persistence: PostgreSQL with Prisma (or equivalent ORM) for pet entities
- File Storage: Object storage abstraction for image upload payloads

## Why This Stack

- Strong TypeScript support improves API contract fidelity.
- Fastify gives performant request handling and schema-native validation.
- Contract-test tooling closes the gap between declared and actual behavior.
- Standard Node ecosystem makes local onboarding quick.

## Avoid

- Hand-written request validators detached from OpenAPI source.
- Ad-hoc error responses that do not map to contract status codes.
- Upload handling without explicit size/type guardrails.
