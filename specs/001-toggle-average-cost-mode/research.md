# Research: Toggle Average Cost Calculation Mode

## Summary

This document outlines the technical decisions and best practices for implementing the "Toggle Average Cost Calculation Mode" feature. The technology stack is well-defined within the existing project, so this research focuses on confirming the approach rather than evaluating new technologies.

---

### Decision 1: Backend Framework and ORM

- **Decision**: Use **Next.js API Routes** for the backend endpoint and **Drizzle ORM** for database interaction.
- **Rationale**: This aligns with the existing project structure (`src/app/api`, `src/lib/drizzle`). Maintaining consistency reduces complexity and cognitive overhead for developers. Drizzle ORM provides a type-safe way to interact with the PostgreSQL database, which is crucial for preventing data-related errors.
- **Alternatives Considered**: None. Deviating from the established project stack for a small feature like this would be inefficient and create unnecessary maintenance burden.

---

### Decision 2: Frontend Framework and UI Components

- **Decision**: Use **React** with **Next.js** for the frontend. The UI toggle will be built as a server component that uses a server action to update the setting, or a client component that calls the API route. Given the component libraries in use (`shadcn`, `radix-ui`), a pre-built `Switch` component will be used.
- **Rationale**: The project is a Next.js application, so using React is the only logical choice. Using existing component libraries ensures visual consistency and saves development time. Server actions are a modern Next.js feature that simplifies form handling and mutations.
- **Alternatives Considered**: A full-page reload on toggle is a simpler but less user-friendly alternative that was rejected.

---

### Decision 3: Database Schema Modification

- **Decision**: Add a new `boolean` column named `auto_update_average_cost` to the `bodegas` table.
- **Rationale**: This directly implements `FR-002` from the specification. A boolean flag is the most efficient way to store a simple on/off state. The default value will be set to `false` ('Manual') as per `FR-007`.
- **Alternatives Considered**: Storing this configuration in a separate table was considered but rejected as over-engineering for a simple 1:1 relationship between a warehouse and its setting.

---

### Decision 4: API Design

- **Decision**: Implement a `PATCH` endpoint at `src/app/api/bodegas/[id]/route.ts`.
- **Rationale**: A `PATCH` request is the correct semantic choice for updating a single field on an existing resource (the warehouse). The endpoint will accept a JSON body like `{ "autoUpdateAverageCost": true }`.
- **Alternatives Considered**: A `POST` request could be used, but `PATCH` is more specific to the action being performed. A dedicated endpoint like `/api/bodegas/[id]/toggle-cost-mode` was also considered but is less RESTful.
