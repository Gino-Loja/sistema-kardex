# Research: Category CRUD and Access Control

## Decisions

- Decision: Use existing Next.js App Router patterns for auth gating and RBAC in category pages and actions.
  Rationale: Consistency with items feature reduces risk and keeps behavior aligned across inventory modules.
  Alternatives considered: Custom middleware-only gating, client-only gating.

- Decision: Keep category CRUD within the existing web application structure (frontend + backend).
  Rationale: Matches current repository layout and avoids introducing new services.
  Alternatives considered: Separate service for categories.

- Decision: Use the existing PostgreSQL data store for categories and items association.
  Rationale: Aligns with current inventory data model and referential integrity needs.
  Alternatives considered: Separate storage or caching layer.
