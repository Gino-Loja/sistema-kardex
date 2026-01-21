# Implementation Plan: Movimiento con Precio de Referencia

**Branch**: `001-movement-ref-price` | **Date**: 2026-01-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-movement-ref-price\spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The feature will ensure that item movements correctly display and utilize the reference price (`costoPromedio`). This will be achieved by refining the logic in the `useAverageCost` hook and `hasZeroCostWarning` function in `movement-form.tsx` to handle loading states, negative costs, and concurrent edits correctly.

## Technical Context

**Language/Version**: TypeScript
**Primary Dependencies**: React, Next.js
**Storage**: PostgreSQL
**Testing**: vitest with Testing Library
**Target Platform**: Web application
**Project Type**: Web application
**Performance Goals**: Cost retrieval within 500ms.
**Constraints**: First-user-wins concurrency model.
**Scale/Scope**: Up to 1,000 items per bodega.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file] - Skipped as constitution is a template.

## Project Structure

### Documentation (this feature)

```text
specs/001-movement-ref-price/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
└── scripts/

tests/
├── integration/
└── unit/
```

**Structure Decision**: The project is a web application with a `src` directory containing the main source code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |
