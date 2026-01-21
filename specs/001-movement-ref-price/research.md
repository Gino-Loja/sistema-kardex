# Research

## Database

- **Decision**: The database is PostgreSQL.
- **Rationale**: `drizzle.config.ts` specifies `dialect: "postgresql"`. The `pg` package is a dependency in `package.json`.
- **Alternatives considered**: None, as the choice is clear from the project configuration.

## Testing Framework

- **Decision**: The testing framework is `vitest` with `Testing Library`.
- **Rationale**: `package.json` defines the `test` script as `vitest`. `vitest` and `@testing-library/react` are listed as `devDependencies`.
- **Alternatives considered**: None, as the choice is clear from the project configuration.
