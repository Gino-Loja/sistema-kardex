# Implementation Plan: Gestion de bodegas

**Branch**: `001-bodega-management` | **Date**: 2026-01-09 | **Spec**: `specs/001-bodega-management/spec.md`
**Input**: Feature specification from `specs/001-bodega-management/spec.md`

## Summary

Habilitar gestion de bodegas con creacion, edicion, consulta de detalles y asignacion de items a bodega, respetando roles y validaciones. Se aprovecha el modelo existente de bodegas y la relacion item-bodega para registrar asignaciones sin afectar movimientos de inventario.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Drizzle ORM, better-auth, Tailwind CSS 4  
**Storage**: PostgreSQL (primario), MinIO (assets/imagenes)  
**Testing**: `npm test` (segun configuracion del repo)  
**Target Platform**: Web (Next.js App Router)  
**Project Type**: Web application (frontend + backend folders)  
**Performance Goals**: Vista de detalle de bodega en <= 2 segundos percibidos por el usuario  
**Constraints**: Validacion en cliente/servidor, RBAC por rol, auditoria en operaciones criticas  
**Scale/Scope**: Una organizacion con cientos de bodegas y miles de items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion,
  dominio e infraestructura. (PASS)
- TypeScript `strict` + `noImplicitAny` activos; contratos tipados entre capas. (PASS)
- Server Components por defecto; Client Components justificados por necesidad de UI. (PASS)
- Nomenclatura: espanol para logica de negocio, ingles para componentes/estructura. (PASS)
- Validacion de datos en cliente y servidor con reglas consistentes. (PASS)
- Seguridad: autenticacion/autorizacion en rutas protegidas, RBAC, sanitizacion de
  inputs, uploads seguros, auditoria en operaciones criticas. (PASS)
- Roles y permisos: Admin con acceso total; Bodeguero con movimientos, inventario
  y reportes basicos. (PASS)
- Datos: integridad referencial, transacciones en operaciones criticas, reglas NIC 2,
  bitacora append-only, costo promedio ponderado automatico. (PASS)
- UX: feedback claro, estados de carga/error, validacion en tiempo real,
  confirmaciones destructivas, responsive. (PASS)
- Calidad: tests para logica contable critica, errores robustos, performance con
  lazy loading/streaming, documentacion de funciones complejas. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-bodega-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|-- tasks.md
```

### Source Code (repository root)

```text
backend/
frontend/
tests/
```

**Structure Decision**: Opcion de aplicacion web con carpetas `backend/` y `frontend/` mas `tests/`, alineado con la estructura del repositorio.

## Phase 0: Outline & Research

### Research Tasks

- Definir permisos por rol para crear/editar bodegas vs asignar items.
- Confirmar uso del modelo existente `bodegas` e `item_bodegas` sin afectar movimientos.

### Output

- `specs/001-bodega-management/research.md`

## Phase 1: Design & Contracts

### Data Model

- Documentar entidades Bodega e ItemBodega con campos y reglas de validacion.

### API Contracts

- Endpoints para CRUD de bodegas y asignacion de items a bodega.

### Quickstart

- Flujo rapido para probar la funcion desde UI o API.

### Output

- `specs/001-bodega-management/data-model.md`
- `specs/001-bodega-management/contracts/`
- `specs/001-bodega-management/quickstart.md`

## Phase 1: Agent Context Update

- Ejecutar `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`

## Constitution Check (Post-Design)

- Revalidar cumplimiento tras Phase 1 design. (PASS)

## Phase 2: Planning

- Definir tareas detalladas por capa (UI, casos de uso, DAL, validaciones, pruebas).
- Alinear pruebas con escenarios de aceptacion.

## Complexity Tracking

No se requieren violaciones a la constitucion.
