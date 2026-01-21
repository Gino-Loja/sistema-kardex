# Implementation Plan: Category CRUD and Access Control

**Branch**: `001-category-crud-auth` | **Date**: 2026-01-09 | **Spec**: `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\spec.md`
**Input**: Feature specification from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\spec.md`

## Summary

Implement authenticated category CRUD with role-based permissions (Admin and Bodeguero), supporting list, create, detail, edit, and delete flows. Categories have required names and optional descriptions; deletion of a category leaves assigned items uncategorized.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4, Drizzle ORM, better-auth
**Storage**: PostgreSQL (primary)
**Testing**: npm test (project standard), npm run lint
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Category list and detail pages render in under 2 seconds p95 for typical datasets
**Constraints**: Auth + RBAC enforced on all category routes; validation on client and server; Server Components by default
**Scale/Scope**: Category management for inventory module; supports up to 10k categories without UX degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion, dominio e infraestructura.
- TypeScript `strict` + `noImplicitAny` activos; contratos tipados entre capas.
- Server Components por defecto; Client Components justificados por necesidad de UI.
- Nomenclatura: espanol para logica de negocio, ingles para componentes/estructura.
- Validacion de datos en cliente y servidor con reglas consistentes.
- Seguridad: autenticacion/autorizacion en rutas protegidas, RBAC, sanitizacion de inputs, uploads seguros, auditoria en operaciones criticas.
- Roles y permisos: Admin con acceso total; Bodeguero con movimientos, inventario y reportes basicos.
- Datos: integridad referencial, transacciones en operaciones criticas, reglas NIC 2, bitacora append-only, costo promedio ponderado automatico.
- UX: feedback claro, estados de carga/error, validacion en tiempo real, confirmaciones destructivas, responsive.
- Calidad: tests para logica contable critica, errores robustos, performance con lazy loading/streaming, documentacion de funciones complejas.

Gate status (pre-research): PASS

## Project Structure

### Documentation (this feature)

```text
C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts\
`-- tasks.md
```

### Source Code (repository root)

```text
C:\Users\ginol\Desktop\projects\sistema-kardex\
|-- backend\
|   `-- src\
|-- frontend\
|   `-- src\
`-- tests\
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` directories; category UI and routes live under `frontend/`, server-side actions and DAL under `backend/`.

## Phase 0: Outline and Research

- Resolve technical context unknowns: none.
- Confirm best practices for Next.js App Router auth gating and RBAC: follow existing project patterns from items feature.
- Deliverable: `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\research.md`.

## Phase 1: Design and Contracts

- Data model defined in `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\data-model.md`.
- API contracts in `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\contracts\categories.openapi.yaml`.
- Developer quickstart in `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\quickstart.md`.
- Agent context updated via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`.

## Constitution Check (Post-Design)

No violations introduced; design follows auth/RBAC, validation, and layering requirements.

## Phase 2: Planning Gate

Ready for task breakdown in `/speckit.tasks`.
