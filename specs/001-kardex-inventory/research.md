# Research: Sistema Kardex NIIF

## Decisions

- Decision: Use Next.js App Router with Server Components by default and Client
  Components only for interactive forms and data tables.
  Rationale: Aligns with constitution for performance and maintainability.
  Alternatives considered: CSR-only React app, Pages Router.

- Decision: Use Server Actions for mutations and Route Handlers for query endpoints.
  Rationale: Keeps writes close to domain logic and leverages Next.js patterns.
  Alternatives considered: Separate backend service.

- Decision: Use Drizzle ORM with PostgreSQL and Drizzle Kit migrations.
  Rationale: Type-safe queries and migration control.
  Alternatives considered: Prisma, raw SQL.

- Decision: Use Better-Auth for authentication and sessions with RBAC for Admin
  and Bodeguero roles.
  Rationale: Meets security requirements with minimal integration overhead.
  Alternatives considered: NextAuth, custom auth.

- Decision: Use Zod schemas shared between server and client, with React Hook Form.
  Rationale: Consistent validation and reduced duplication.
  Alternatives considered: Yup, custom validation.

- Decision: Use TanStack Query for server state caching in client components.
  Rationale: Standard pattern for data fetching and caching.
  Alternatives considered: SWR.

- Decision: Use MinIO for product image storage and Resend for email notifications.
  Rationale: Matches requirements for file handling and password recovery.
  Alternatives considered: S3-compatible services, SMTP provider.

- Decision: Testing stack uses Vitest + React Testing Library and Playwright for e2e.
  Rationale: Fast unit tests, UI interaction coverage, and browser-level validation.
  Alternatives considered: Jest + Cypress.
