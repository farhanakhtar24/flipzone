# 0004 — MongoDB single-node replica set for local/Docker

**Status:** Accepted
**Date:** Phase 4 (Docker)

## Context

Prisma's MongoDB connector requires transactions, which require a **replica
set** — a bare `mongod` fails with "Transaction numbers are only allowed on a
replica set member". Atlas provides this transparently; local Docker does not.

## Decision

`docker-compose.yml` boots `mongo:7` with `--replSet rs0` and auto-executes
`rs.initiate()` on first start; the app connects with
`mongodb://mongo:27017/flipzone?replicaSet=rs0&directConnection=true`.
Production uses Atlas (already a replica set).

## Consequences

- Dev ↔ prod parity for transaction behavior.
- Slightly slower container first-boot (election); documented in the file.
- No code branches keyed on environment.
