# Implementation Plan: Mejoras UX Movimientos - Estado y Costo Automático

**Branch**: `004-movement-ux-fixes` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-movement-ux-fixes/spec.md`

## Summary

Implementar dos mejoras críticas en el módulo de movimientos:
1. **Gestión de estados desde UI**: Agregar botones "Publicar" y "Anular" en la vista de detalle de movimientos para permitir transiciones de estado (Borrador → Publicado → Anulado).
2. **Costo automático en salidas**: El campo de costo unitario debe ser de solo lectura y auto-calculado con el costo promedio del ítem+bodega cuando el tipo de movimiento es "Salida" o "Transferencia".

Ambas funcionalidades extienden el sistema existente sin modificar el esquema de base de datos.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Drizzle ORM 0.41.0, Zod 4.3.5, better-auth 1.4.10, react-hook-form 7.70.0
**Storage**: PostgreSQL (Drizzle ORM) - tablas existentes: `movimientos`, `detalleMovimientos`, `itemBodegas`
**Testing**: Vitest 2.1.3, Playwright 1.49.0
**Target Platform**: Web application (Next.js App Router)
**Project Type**: Web application (fullstack monorepo)
**Performance Goals**: Interacciones de usuario < 200ms, carga de costos promedio instantánea
**Constraints**: No cambios a esquema DB, compatibilidad con movimientos existentes
**Scale/Scope**: Sistema interno, < 100 usuarios concurrentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Library-First | N/A | Feature de UI, no requiere nueva librería |
| CLI Interface | N/A | Feature de frontend, no requiere CLI |
| Test-First | PASS | Se escribirán tests para server actions y componentes |
| Integration Testing | PASS | Tests de integración para flujo publicar/anular |
| Observability | PASS | Logging existente en movements.service.ts |
| Simplicity | PASS | Extiende código existente sin nuevas abstracciones |

**Gate Status**: PASS - Proceder con Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-movement-ux-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (dashboard)/
│   │   └── movements/
│   │       ├── [id]/
│   │       │   └── page.tsx          # MODIFICAR: Agregar botones Publicar/Anular
│   │       └── page.tsx              # MODIFICAR: Agregar badge estado
│   └── api/
│       └── movements/
│           └── [id]/
│               └── route.ts          # MODIFICAR: Agregar endpoints estado
│
├── components/
│   └── movements/
│       ├── movement-form.tsx         # MODIFICAR: Lógica costo automático
│       ├── movement-list-table.tsx   # MODIFICAR: Badge estado visual
│       ├── movement-detail-view.tsx  # NUEVO: Componente vista detalle
│       ├── movement-status-badge.tsx # NUEVO: Badge estado reutilizable
│       └── movement-action-buttons.tsx # NUEVO: Botones Publicar/Anular
│
├── lib/
│   ├── data/
│   │   └── movements.ts              # MODIFICAR: Agregar getAverageCost()
│   │
│   └── dal/
│       ├── repositories/
│       │   └── item-bodegas.repository.ts # USAR: getCostoPromedio()
│       └── services/
│           └── movements.service.ts  # USAR: publicarMovimiento(), anularMovimiento()
│
└── hooks/
    └── movements/
        └── use-average-cost.ts       # NUEVO: Hook para obtener costo promedio
```

**Structure Decision**: Extensión del patrón existente. Se agregan componentes nuevos siguiendo la convención de `/components/movements/`. Se reutilizan servicios existentes (`movements.service.ts`) que ya implementan `publicarMovimiento()` y `anularMovimiento()`.

## Complexity Tracking

> No hay violaciones de constitución que justificar.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
