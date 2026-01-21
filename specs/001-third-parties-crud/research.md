# Research: Third Parties Management

## Decisions

- **Decision**: Use the existing Next.js App Router structure with server-first rendering and client components only for interactive table actions and the delete modal.
  **Rationale**: Aligns with project constitution and minimizes client-side complexity while enabling required interactions.
  **Alternatives considered**: Fully client-rendered list; rejected due to performance and constitution guidance.

- **Decision**: Paginate at 20 items per page with explicit navigation controls.
  **Rationale**: Matches the feature requirement and keeps list interactions predictable.
  **Alternatives considered**: Infinite scroll; rejected because pagination is explicitly required.

- **Decision**: Use standard REST-style contracts for list, create, view, edit, and delete.
  **Rationale**: Fits existing data-access patterns and keeps CRUD actions explicit.
  **Alternatives considered**: Single bulk endpoint; rejected because it reduces clarity and testability.

## Resolved Unknowns

- No outstanding technical unknowns remain for this feature.
