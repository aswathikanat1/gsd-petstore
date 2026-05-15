# Getting Started

## Prerequisites

- Node.js installed (Node 20+ recommended for CI parity).
- npm installed.

## Install

```bash
npm ci
```

## Run Locally

```bash
npm run dev
```

The server starts on http://localhost:3000 by default.

## Authentication Mode

Set AUTH_STRICT=false for permissive bootstrap mode; omit or set AUTH_STRICT=true to enforce 401 for missing/invalid bearer token on protected operations.

## Validate OpenAPI Contract

```bash
npm run openapi:lint
```

## Generate API Docs

```bash
npm run docs:generate
```

## Run Contract Tests

```bash
npm run test:contract
```

## Release Verification

Run this sequence before opening or merging a release PR:

```bash
npm run build
npm run openapi:lint
npm run docs:generate
npm run test:contract
```

## View API Docs

Open http://localhost:3000/api-docs in your browser.
