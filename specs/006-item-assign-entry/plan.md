# Implementation Plan: Movimiento de Entrada Automático al Asignar Items a Bodega

**Branch**: `006-item-assign-entry` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-item-assign-entry/spec.md`

## Summary

Modificar el flujo de asignación de items a bodegas para que cuando se asigne un item con stock inicial > 0, se cree automáticamente un movimiento de entrada publicado. Esto asegura que el kardex refleje correctamente el inventario desde el momento de la asignación.

**Enfoque técnico**: Extender la función `assignItemsToBodega` en `src/lib/data/item-bodegas.ts` para crear un movimiento de entrada usando los servicios existentes (`createMovement`, `publicarMovimiento`) y el servicio de promedio ponderado (`WeightedAverageService`).

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x
**Framework**: Next.js 16.1.1, React 19.2.3
**Primary Dependencies**: Drizzle ORM 0.41.0, Zod 4.3.5, better-auth 1.4.10, react-hook-form 7.70.0
**Storage**: PostgreSQL (via Drizzle ORM)
**Testing**: Vitest 2.1.3
**Target Platform**: Web application (Next.js App Router)
**Project Type**: Web (fullstack monorepo)
**Performance Goals**: Asignación de hasta 50 items simultáneos en < 2 segundos
**Constraints**: Transacciones atómicas (todo o nada), sin modificaciones de UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| No new external dependencies | PASS | Usa servicios existentes |
| Uses existing patterns | PASS | Sigue patrón DAL: data → service → repository |
| Maintains test coverage | PASS | Se agregarán tests para nueva funcionalidad |
| No breaking changes | PASS | API backwards-compatible (nuevos campos opcionales) |

## Project Structure

### Documentation (this feature)

```text
specs/006-item-assign-entry/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── assign-items.yaml
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── bodegas/
│           └── [id]/
│               └── items/
│                   └── route.ts        # MODIFICAR: Endpoint POST
├── lib/
│   ├── data/
│   │   └── item-bodegas.ts             # MODIFICAR: assignItemsToBodega
│   ├── dal/
│   │   └── services/
│   │       ├── movements.service.ts    # EXISTENTE: publicarMovimiento
│   │       └── weighted-average.service.ts  # EXISTENTE: updateStockAndAverageCost
│   └── validators/
│       └── item-bodega.ts              # CREAR: Validador para asignación con stock
└── components/
    └── bodegas/
        └── assign-items-dialog.tsx     # EXISTENTE (sin cambios, UI ya soporta campos)

tests/
└── lib/
    └── data/
        └── item-bodegas.test.ts        # CREAR: Tests para nueva funcionalidad
```

**Structure Decision**: Mantener la estructura existente del proyecto Next.js. Los cambios se concentran en:
1. `src/lib/data/item-bodegas.ts` - Lógica principal
2. `src/app/api/bodegas/[id]/items/route.ts` - Endpoint API
3. `src/lib/validators/item-bodega.ts` - Nuevo validador Zod

## Complexity Tracking

> No hay violaciones de la constitución que justificar.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Approach

### Archivos a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `src/lib/validators/item-bodega.ts` | Crear esquema Zod para asignación con stock/costo | P1 |
| `src/lib/data/item-bodegas.ts` | Extender `assignItemsToBodega` para crear movimiento | P1 |
| `src/app/api/bodegas/[id]/items/route.ts` | Actualizar endpoint POST para aceptar stock/costo | P1 |
| `tests/lib/data/item-bodegas.test.ts` | Tests para nueva funcionalidad | P1 |

### Servicios Existentes a Reutilizar

1. **`createMovement`** (`src/lib/data/movements.ts`)
   - Crea movimiento en estado borrador
   - Acepta `tipo`, `bodegaDestinoId`, `detalles[]`

2. **`publicarMovimiento`** (`src/lib/dal/services/movements.service.ts`)
   - Cambia estado a "publicado"
   - Ejecuta `WeightedAverageService.updateStockAndAverageCost`
   - Registra auditoría

3. **`WeightedAverageService`** (`src/lib/dal/services/weighted-average.service.ts`)
   - Calcula y actualiza costo promedio ponderado
   - Actualiza `item_bodegas.stockActual` y `costoPromedio`

### Flujo de Implementación

```
POST /api/bodegas/:id/items
    │
    ▼
Validar input (Zod)
    │
    ▼
Verificar bodega existe y está activa
    │
    ▼
Verificar items no están ya asignados
    │
    ▼
[TRANSACCIÓN ATÓMICA]
    │
    ├─▶ Crear registros en item_bodegas
    │
    ├─▶ Si hay items con stock > 0:
    │       │
    │       ├─▶ Crear movimiento tipo "entrada"
    │       │   con detalles (itemId, cantidad, costoUnitario)
    │       │
    │       └─▶ Publicar movimiento (ejecuta weighted average)
    │
    └─▶ Commit o Rollback completo
    │
    ▼
Response: { assigned: [...], movimientoId?: string }
```

## Dependencies

| Dependencia | Estado | Acción |
|-------------|--------|--------|
| `movements.service.ts` | Existente | Usar `publicarMovimiento` |
| `weighted-average.service.ts` | Existente | Se llama internamente por `publicarMovimiento` |
| `createMovement` | Existente | Usar para crear movimiento borrador |
| Drizzle transactions | Existente | Usar para atomicidad |

## Risks & Mitigations

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Inconsistencia si falla a mitad de transacción | Baja | Alto | Usar transacción atómica Drizzle |
| Conflictos de concurrencia | Baja | Medio | Ya existe campo `version` en movimientos |
| Datos históricos inconsistentes | N/A | N/A | Out of scope - no se migran datos existentes |

## Phase Outputs

- **Phase 0**: `research.md` - Decisiones técnicas documentadas
- **Phase 1**: `data-model.md`, `contracts/assign-items.yaml`, `quickstart.md`
- **Phase 2**: `tasks.md` (generado por `/speckit.tasks`)
