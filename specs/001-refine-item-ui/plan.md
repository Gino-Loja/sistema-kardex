# Implementation Plan: Refine Item UI

**Branch**: `001-refine-item-ui` | **Date**: 2026-01-09 | **Spec**: `specs/001-refine-item-ui/spec.md`
**Input**: Feature specification from `specs/001-refine-item-ui/spec.md`

## Summary

Remove thumbnails from the item table, enlarge and emphasize the item detail image and existing fields, and make row actions responsive by using an overflow menu on small screens while keeping actions visible on desktop.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4  
**Storage**: PostgreSQL (primary), MinIO (assets)  
**Testing**: `npm test`, `npm run lint`  
**Target Platform**: Modern web browsers
**Project Type**: Web application  
**Performance Goals**: No visual overlap of actions at 320px; detail image fits within viewport width  
**Constraints**: Responsive behavior for 320px-1440px; accessible labels for action icons  
**Scale/Scope**: Internal inventory UI for daily operations

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

## Project Structure

### Documentation (this feature)

```text
specs/001-refine-item-ui/
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
|-- components/
`-- lib/

tests/
```

**Structure Decision**: Single Next.js app in the repo root with `src/` for UI and `tests/` for test assets.

## Complexity Tracking

No constitution violations identified for this feature.
