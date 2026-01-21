# Implementation Plan: Navegacion completa del panel y mejora del navbar

**Branch**: `001-panel-pages-navbar` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-panel-pages-navbar/spec.md`

## Summary

Expose todas las paginas del panel en el navbar con orden y agrupacion existentes, mantener acceso por rol, y mejorar la claridad de ubicacion y overflow mediante secciones colapsables con scroll interno.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Tailwind CSS 4  
**Storage**: PostgreSQL (primary), MinIO (imagenes)  
**Testing**: Vitest, Testing Library, Playwright  
**Target Platform**: Web (navegadores modernos)  
**Project Type**: Web (Next.js App Router)  
**Performance Goals**: Navegacion a pagina objetivo en < 10s (95% usuarios); render del navbar sin retrasos perceptibles  
**Constraints**: Respetar RBAC y orden/agrupacion existente; maximo 2 interacciones por acceso  
**Scale/Scope**: Todas las paginas del panel para los roles actuales

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

**Status**: Pass (no violations).

## Project Structure

### Documentation (this feature)

```text
specs/001-panel-pages-navbar/
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
```

**Structure Decision**: Single Next.js web app under `src/` with shared tests in `tests/`.

## Phase 0: Outline & Research

- Documentar decisiones sobre fuente de navegacion y permisos.
- Validar patron de secciones colapsables con scroll interno para overflow.
- Confirmar consistencia con RBAC actual.

## Phase 1: Design & Contracts

- Definir modelo conceptual de navegacion (secciones, paginas, permisos).
- Definir contrato de lectura para navegacion del panel.
- Preparar quickstart de verificacion manual.

## Phase 2: Planning Output

- Plan listo para desglose en tareas con `/speckit.tasks`.

## Post-Design Constitution Check

**Status**: Pass (no violations).

## Complexity Tracking

No violations to justify.
