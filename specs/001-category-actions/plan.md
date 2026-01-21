# Implementation Plan: Category actions (edit/delete)

**Branch**: `001-category-actions` | **Date**: 2026-01-09 | **Spec**: C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\spec.md
**Input**: Feature specification from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\spec.md`

## Summary

Add category list actions for edit navigation and delete with confirmation, including permission-based visibility, success feedback, and defined delete behavior for in-use categories.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4, Drizzle ORM, better-auth  
**Storage**: PostgreSQL (primary), MinIO (assets)  
**Testing**: `npm test`, `npm run lint`  
**Target Platform**: Web app (server + browser)  
**Project Type**: Single web application (Next.js)  
**Performance Goals**: 95% of delete actions reflect in the list within 5 seconds; edit navigation reachable in 2 clicks or less  
**Constraints**: Hide disallowed actions; delete leaves items without category; confirmation modal shows impact message; concurrent delete closes modal silently  
**Scale/Scope**: Up to 100k items and 1k categories with responsive UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion,
  dominio e infraestructura.
- TypeScript `strict` + `noImplicitAny` activos; contratos tipados entre capas.
- Server Components por defecto; Client Components justificados por necesidad de UI.
- Nomenclatura: espanol para logica de negocio, ingles para componentes/estructura.
- Validacion de datos en cliente y servidor con reglas consistentes.
- Seguridad: autenticacion/autorizacion en rutas protegidas, RBAC, sanitizacion de
  inputs, uploads seguros, auditoria en operaciones criticas.
- Roles y permisos: Admin con acceso total; Bodeguero con movimientos, inventario
  y reportes basicos.
- Datos: integridad referencial, transacciones en operaciones criticas, reglas NIC 2,
  bitacora append-only, costo promedio ponderado automatico.
- UX: feedback claro, estados de carga/error, validacion en tiempo real,
  confirmaciones destructivas, responsive.
- Calidad: tests para logica contable critica, errores robustos, performance con
  lazy loading/streaming, documentacion de funciones complejas.

Result: Pass (no violations identified for this feature).

## Project Structure

### Documentation (this feature)

```text
C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts\
|-- tasks.md
```

### Source Code (repository root)

```text
C:\Users\ginol\Desktop\projects\sistema-kardex\
|-- src\
|   |-- app\
|   |-- components\
|   |-- hooks\
|   |-- lib\
|   |-- scripts\
|   `-- email-template\
|-- tests\
|-- public\
|-- drizzle.config.ts
|-- package.json
|-- tsconfig.json
```

**Structure Decision**: Single Next.js application under `src/` with shared tests in `tests/`.

## Phase 0: Outline & Research

### Research Tasks

- Confirm UI and API expectations for delete behavior when categories are in use.
- Validate permission-driven visibility for actions and feedback patterns.

### Output

- C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\research.md

## Phase 1: Design & Contracts

### Data Model Output

- C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\data-model.md

### API Contracts Output

- C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\contracts\categories-actions.openapi.yaml

### Quickstart Output

- C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-actions\quickstart.md

### Agent Context Update

- Run: C:\Users\ginol\Desktop\projects\sistema-kardex\.specify\scripts\powershell\update-agent-context.ps1 -AgentType codex

### Constitution Check (Post-Design)

Result: Pass (no violations introduced by the design outputs).

## Phase 2: Planning

- Generate tasks after design validation in `/speckit.tasks`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
