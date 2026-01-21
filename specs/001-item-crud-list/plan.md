# Implementation Plan: Item CRUD and Listing

**Branch**: `001-item-crud-list` | **Date**: 2026-01-08 | **Spec**: `specs/001-item-crud-list/spec.md`
**Input**: Feature specification from `/specs/001-item-crud-list/spec.md`

## Summary

Add item CRUD flows with dedicated create/edit routes, list paging/search/filtering, optional item image upload stored in MinIO, and delete confirmation. Include list thumbnail display, enforce image size/format limits, and keep list updates in sync after changes.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Drizzle ORM, better-auth, Tailwind CSS 4
**Storage**: PostgreSQL, MinIO (bucket: items)
**Testing**: Vitest, Testing Library, Playwright
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (single Next.js app)
**Performance Goals**: First page of item list loads within 3 seconds during normal business hours
**Constraints**: Max image size 5 MB; allowed formats JPEG/PNG/WebP; one optional image per item
**Scale/Scope**: Small-to-medium inventory usage (assume up to 50k items, <=100 concurrent users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion, dominio e infraestructura.
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

Constitution Check Result: PASS
Constitution Check (Post-Design): PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-item-crud-list/
|-- plan.md              # This file (/speckit.plan command output)
|-- research.md          # Phase 0 output (/speckit.plan command)
|-- data-model.md        # Phase 1 output (/speckit.plan command)
|-- quickstart.md        # Phase 1 output (/speckit.plan command)
|-- contracts/           # Phase 1 output (/speckit.plan command)
|-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
|-- app/
|-- components/
|-- email-template/
|-- hooks/
|-- lib/
|-- scripts/

public/

tests/
```

**Structure Decision**: Single Next.js application with all source under `src/` and tests under `tests/`.

## Complexity Tracking

No constitution violations requiring justification.

## Phase 0: Outline and Research

- Confirm best-practice approach for item image storage in MinIO (bucket lifecycle, delete behavior).
- Confirm API contract patterns for list filters (pagination, search, date range, status).
- Confirm upload constraints enforcement for size and format.

## Phase 1: Design and Contracts

- Data model focused on Item and ItemImage metadata, with relationship to item-bodega inventory if needed.
- Define REST endpoints for list, create, edit, and delete, including multipart uploads.
- Document quickstart steps to run the feature locally.
- Update agent context for the current tech stack.

## Phase 2: Planning (deferred to /speckit.tasks)

- Break down UI routes, forms, validations, list filters, and server actions/API handlers.
- Add tests for validation, image handling, and list filters.
