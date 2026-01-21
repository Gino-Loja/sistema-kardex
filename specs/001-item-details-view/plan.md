# Implementation Plan: Vista de detalles de item

**Branch**: `001-item-details-view` | **Date**: 2026-01-09 | **Spec**: C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-details-view\spec.md
**Input**: Feature specification from `/specs/001-item-details-view/spec.md`

## Summary

Agregar vista de detalles del item accesible desde la lista (accion "Ver" y enlace en el nombre), con manejo de item inexistente y acciones visibles segun permisos, reutilizando la estructura actual de items y rutas.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4, Drizzle ORM, better-auth  
**Storage**: PostgreSQL (primary), MinIO (assets)  
**Testing**: `npm test`, `npm run lint`  
**Target Platform**: Web (modern browsers)  
**Project Type**: web (single Next.js app)  
**Performance Goals**: Navegacion a detalles visible en <= 2s en condiciones normales  
**Constraints**: Server Components por defecto; RBAC en acciones; confirmacion para eliminar  
**Scale/Scope**: Listas con miles de items sin degradacion perceptible

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

Status: Pass

## Project Structure

### Documentation (this feature)

```text
specs/001-item-details-view/
|-- plan.md              # This file (/speckit.plan command output)
|-- research.md          # Phase 0 output (/speckit.plan command)
|-- data-model.md        # Phase 1 output (/speckit.plan command)
|-- quickstart.md        # Phase 1 output (/speckit.plan command)
|-- contracts/           # Phase 1 output (/speckit.plan command)
`-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
|-- app/
|   `-- items/
|       `-- [id]/
|-- components/
|   `-- items/
|-- lib/
`-- styles/

tests/
```

**Structure Decision**: Single Next.js application under `src/` with feature-specific
UI in `src/app/items` and shared UI in `src/components/items`.

## Complexity Tracking

> No constitution violations.

## Phase 0: Outline & Research

### Research Tasks

No open technical unknowns requiring research. Existing stack and patterns are reused.

### Research Findings

- Decision: Reusar la ruta de detalles `items/[id]` existente en App Router.
  Rationale: Minimiza cambios y alinea con la estructura actual.
  Alternatives considered: Crear una vista separada fuera de `items/[id]`.

- Decision: Ocultar acciones sin permiso en la lista.
  Rationale: Evita errores y confusiones al operar items.
  Alternatives considered: Mostrar deshabilitado o bloquear al intentar.

- Decision: Mensaje de item no encontrado con enlace a la lista.
  Rationale: Mantiene contexto y facilita recuperacion.
  Alternatives considered: Redireccion automatica sin explicacion.

## Phase 1: Design & Contracts

### Data Model

See: `specs/001-item-details-view/data-model.md`

### API Contracts

See: `specs/001-item-details-view/contracts/items.yaml`

### Quickstart

See: `specs/001-item-details-view/quickstart.md`

### Agent Context Update

Run: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`

## Constitution Check (Post-Design)

Status: Pass
