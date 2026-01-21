# Implementation Plan: Toggle Average Cost Calculation Mode

**Branch**: `001-toggle-average-cost-mode` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-toggle-average-cost-mode/spec.md`

## Summary

This feature introduces a UI control to toggle the average cost calculation mode for a warehouse between 'Automatic' and 'Manual'. This involves adding a new boolean field to the `bodegas` table, creating a UI component on the warehouse details page, and implementing a backend endpoint to update this setting. The core logic for calculating the average cost will be conditionally executed based on this new setting.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Drizzle ORM, Tailwind CSS
**Storage**: PostgreSQL (inferred from `pg` driver)
**Testing**: Vitest
**Target Platform**: Web Browser
**Project Type**: Web application
**Performance Goals**: Introduction of this feature must not increase the average processing time for inbound movements by more than 10%.
**Constraints**: None specified beyond performance goals.
**Scale/Scope**: The feature is localized to the warehouse details page and the inbound movement creation logic.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution file with defined principles was found. Using default best practices:
- **Test-First**: Unit and integration tests will be created for the new logic.
- **Simplicity**: The solution will be implemented in the most straightforward way, adding a simple boolean flag and a conditional check.
- **Observability**: Logging will be implemented as specified (failures only).

The plan appears to comply with these default principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-toggle-average-cost-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

The project follows a standard Next.js application structure. The changes will be implemented within this existing structure.

```text
# Web application
src/
├── app/
│   ├── (dashboard)/
│   │   └── warehouses/
│   │       └── [id]/         # New UI component will be added here
│   └── api/
│       └── bodegas/
│           └── [id]/         # New endpoint will be added/modified here
├── components/
│   └── warehouses/           # New UI component might be defined here
├── lib/
│   ├── dal/
│   │   ├── repositories/
│   │   │   └── bodegas.repository.ts  # Logic to update the new flag
│   │   └── services/
│   │       └── movements.service.ts # Logic to conditionally calculate cost
│   └── drizzle/
│       └── schemas/
│           └── bodegas.ts           # Add new field to the schema
└── tests/
    └── [relevant folders for unit/integration tests]
```

**Structure Decision**: The implementation will follow the existing project structure, which is a standard Next.js web application. Changes will be localized to the `warehouses` feature directories in `app`, `components`, and `lib`.

## Complexity Tracking

No violations of constitutional principles have been identified.