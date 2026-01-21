# Implementation Plan: Asignacion de items a bodega

**Branch**: `001-assign-items` | **Date**: 2026-01-10 | **Spec**: C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-assign-items\spec.md
**Input**: Feature specification from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-assign-items\spec.md`

## Summary

Habilitar asignacion de items a bodega mediante un modal con buscador y seleccion, mostrar items asignados con paginacion de 20 por pagina, permitir edicion inline de stock minimo/actual/maximo y costo promedio con guardado explicito cuando existan cambios pendientes.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4, Drizzle ORM, better-auth  
**Storage**: PostgreSQL (primario), MinIO (assets/imagenes)  
**Testing**: `npm test`, `npm run lint`  
**Target Platform**: Web (navegador moderno)  
**Project Type**: web  
**Performance Goals**: paginacion y cambios inline visibles en < 1s en condiciones normales de red; busqueda de items con resultados en < 2s para catalogos tipicos  
**Constraints**: paginacion fija de 20 items por pagina; cambios no se guardan automaticamente; confirmacion en acciones destructivas  
**Scale/Scope**: 1 pantalla principal de bodega + modal de asignacion; alcance limitado a gestion de items asignados

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

**Gate Status**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-assign-items/
|-- plan.md              # This file (/speckit.plan command output)
|-- research.md          # Phase 0 output (/speckit.plan command)
|-- data-model.md        # Phase 1 output (/speckit.plan command)
|-- quickstart.md        # Phase 1 output (/speckit.plan command)
|-- contracts/           # Phase 1 output (/speckit.plan command)
`-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
frontend/
tests/
```

**Structure Decision**: Opcion web (backend + frontend) segun estructura existente en el repositorio.

## Phase 0 - Outline & Research

- Revisar dependencias existentes y confirmar que no se requiere tecnologia nueva.
- Documentar decisiones sobre flujo de modal, paginacion y guardado explicito.
- Resolver supuestos de busqueda y validaciones de stocks en `research.md`.

## Phase 1 - Design & Contracts

- Definir modelo de datos para asignacion de items a bodega en `data-model.md`.
- Especificar contratos de API para busqueda, asignacion, listado paginado, edicion y eliminacion en `contracts/`.
- Redactar `quickstart.md` con pasos de verificacion funcional.
- Actualizar contexto del agente con script oficial.

## Post-Design Constitution Check

**Gate Status**: PASS

## Phase 2 - Task Planning

- Se generara en `/speckit.tasks` cuando se inicie la fase de tareas.

## Complexity Tracking

Sin violaciones a la constitucion.
