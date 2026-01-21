# Implementation Plan: Third Parties Management

**Branch**: `001-third-parties-crud` | **Date**: 2026-01-09 | **Spec**: `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\spec.md`
**Input**: Feature specification from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\spec.md`

## Summary

Deliver a third parties CRUD flow with list pagination (20 per page), create/edit routes, view detail, and delete confirmation modal, ensuring the list reflects changes after each action.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Drizzle ORM, better-auth, Tailwind CSS 4  
**Storage**: PostgreSQL (primary)  
**Testing**: Vitest, Testing Library, Playwright  
**Target Platform**: Web (modern browsers)  
**Project Type**: Web application  
**Performance Goals**: List view renders 20 rows in under 2 seconds on typical connections  
**Constraints**: 20 rows per page, delete requires confirmation modal, create/edit routes fixed  
**Scale/Scope**: Third parties list, create, view, edit, delete flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion, dominio e infraestructura. PASS (feature uses existing app layers; no new cross-layer coupling needed).
- TypeScript `strict` + `noImplicitAny` activos; contratos tipados entre capas. PASS (project settings unchanged; contracts will be typed).
- Server Components por defecto; Client Components justificados por necesidad de UI. PASS (only modal/table interactions require client components).
- Nomenclatura: espanol para logica de negocio, ingles para componentes/estructura. PASS (routes/components in English; domain naming stays consistent).
- Validacion de datos en cliente y servidor con reglas consistentes. PASS (form validation and server validation required by spec).
- Seguridad: autenticacion/autorizacion en rutas protegidas, RBAC, sanitizacion de inputs, uploads seguros, auditoria en operaciones criticas. PASS (CRUD screens protected; audit trail required).
- Roles y permisos: Admin con acceso total; Bodeguero con movimientos, inventario y reportes basicos. PASS (feature uses existing roles, no new roles).
- Datos: integridad referencial, transacciones en operaciones criticas, reglas NIC 2, bitacora append-only, costo promedio ponderado automatico. PASS (no new accounting logic; referential integrity preserved).
- UX: feedback claro, estados de carga/error, validacion en tiempo real, confirmaciones destructivas, responsive. PASS (explicit in requirements).
- Calidad: tests para logica contable critica, errores robustos, performance con lazy loading/streaming, documentacion de funciones complejas. PASS (no new accounting logic; standard UI flows tested).

## Project Structure

### Documentation (this feature)

```text
specs/001-third-parties-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── third-parties.openapi.yaml
└── tasks.md
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
```

**Structure Decision**: Single Next.js web application under `src/` with tests in `tests/`.

## Phase 0: Outline & Research

**Goal**: Resolve technical unknowns and align decisions with existing stack.

**Output**:
- `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\research.md`

## Phase 1: Design & Contracts

**Goal**: Define data model, API contracts, and verification steps.

**Outputs**:
- `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\data-model.md`
- `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\contracts\third-parties.openapi.yaml`
- `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\quickstart.md`
- Agent context updated via `C:\Users\ginol\Desktop\projects\sistema-kardex\.specify\scripts\powershell\update-agent-context.ps1`

## Phase 2: Planning

**Goal**: Prepare implementation tasks from the completed design artifacts.

**Output**:
- `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-third-parties-crud\tasks.md`

## Constitution Check (Post-Design)

- Re-evaluated after Phase 1: PASS (no deviations introduced by the design artifacts).

## Complexity Tracking

> None. No constitution violations or exceptional complexity required.
