# Data Model: Mejoras UX Movimientos

**Feature**: 004-movement-ux-fixes
**Date**: 2026-01-16

## Overview

Esta feature **no requiere cambios al esquema de base de datos**. Las entidades existentes ya soportan toda la funcionalidad requerida.

## Existing Entities Used

### Movimiento (existente)

```typescript
// Tabla: movimientos
// Schema: src/lib/drizzle/schemas/movimientos.ts

interface Movimiento {
  id: string;                    // UUID, PK
  tipo: "entrada" | "salida" | "transferencia";
  subTipo?: "compra" | "venta" | "devolucion_venta" | "devolucion_compra";
  estado: "borrador" | "publicado" | "anulado";  // ← Campo clave para esta feature
  fecha: Date;
  bodegaOrigenId?: string;       // FK → bodegas (requerido para salida/transferencia)
  bodegaDestinoId?: string;      // FK → bodegas (requerido para entrada/transferencia)
  terceroId?: string;            // FK → terceros (opcional)
  usuarioId: string;             // FK → user
  observacion?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}
```

**Relevancia para esta feature**:
- El campo `estado` ya existe y soporta las transiciones requeridas
- No se requieren nuevos campos

### DetalleMovimiento (existente)

```typescript
// Tabla: detalle_movimientos
// Schema: src/lib/drizzle/schemas/detalle-movimientos.ts

interface DetalleMovimiento {
  id: string;                    // UUID, PK
  movimientoId: string;          // FK → movimientos
  itemId: string;                // FK → items
  cantidad: number;              // NUMERIC(14,4)
  costoUnitario: number;         // NUMERIC(14,4) ← Campo clave para esta feature
  costoTotal: number;            // NUMERIC(14,4), calculado
}
```

**Relevancia para esta feature**:
- El campo `costoUnitario` se llenará automáticamente desde `itemBodegas.costoPromedio` en salidas
- No se requieren nuevos campos

### ItemBodega (existente)

```typescript
// Tabla: item_bodegas
// Schema: src/lib/drizzle/schemas/item-bodegas.ts

interface ItemBodega {
  id: string;                    // UUID, PK
  itemId: string;                // FK → items
  bodegaId: string;              // FK → bodegas
  cantidad: number;              // NUMERIC(14,4), stock actual
  costoPromedio: number;         // NUMERIC(14,4) ← Campo clave para esta feature
  valorTotal: number;            // NUMERIC(14,4), calculado
  actualizadoEn: Date;
}

// Constraint: UNIQUE(itemId, bodegaId)
```

**Relevancia para esta feature**:
- El campo `costoPromedio` se usa para auto-llenar el costo en salidas
- El campo `cantidad` se usa para validar stock disponible

## State Transitions

### Movimiento Estado Machine

```
┌──────────┐     publicar()     ┌────────────┐     anular()     ┌──────────┐
│ BORRADOR │ ─────────────────► │ PUBLICADO  │ ────────────────► │ ANULADO  │
└──────────┘                    └────────────┘                   └──────────┘
     │                               │                                │
     │ editar() ✓                    │ editar() ✗                     │ editar() ✗
     │ eliminar() ✓                  │ eliminar() ✗                   │ eliminar() ✗
     │                               │ anular() ✓                     │
     └───────────────────────────────┴────────────────────────────────┘
```

**Reglas de transición**:
| Estado Actual | Acción | Estado Nuevo | Condiciones |
|---------------|--------|--------------|-------------|
| borrador | publicar | publicado | Stock suficiente (si salida/transferencia) |
| borrador | editar | borrador | - |
| borrador | eliminar | (eliminado) | - |
| publicado | anular | anulado | - |
| anulado | - | - | Estado final, sin transiciones |

## Data Flow

### Flujo: Publicar Movimiento

```
UI (click "Publicar")
    │
    ▼
API Route PATCH /api/movements/[id]/publish
    │
    ▼
movements.service.publicarMovimiento(id)
    │
    ├── Validar estado === "borrador"
    ├── Validar stock si tipo === "salida" | "transferencia"
    ├── Actualizar itemBodegas (cantidad, costoPromedio si entrada)
    ├── Registrar auditoría si cambia costoPromedio
    └── Actualizar movimiento.estado = "publicado"
    │
    ▼
Response { success: true, estado: "publicado" }
```

### Flujo: Obtener Costo Promedio para Formulario

```
UI (seleccionar ítem en formulario de salida)
    │
    ▼
API Route GET /api/item-bodegas/average-cost?bodegaId=X&itemIds=Y,Z
    │
    ▼
item-bodegas.repository.getAverageCosts(bodegaId, [itemIds])
    │
    ▼
Response {
  costs: {
    [itemId1]: { costoPromedio: 499.23, cantidad: 150 },
    [itemId2]: { costoPromedio: 120.50, cantidad: 80 }
  }
}
    │
    ▼
UI actualiza campos costoUnitario (readonly)
```

## Validation Rules

### Al crear/editar movimiento de SALIDA

| Campo | Regla | Mensaje de error |
|-------|-------|------------------|
| tipo | Si "salida" → costoUnitario es readonly | - |
| costoUnitario | Auto-llenado desde itemBodegas.costoPromedio | - |
| cantidad | ≤ itemBodegas.cantidad | "Stock insuficiente: disponible {n}" |
| costoPromedio | Si === 0 → advertencia | "Sin costo promedio establecido" |

### Al publicar movimiento

| Validación | Aplicable a | Acción si falla |
|------------|-------------|-----------------|
| estado === "borrador" | Todos | Error 409: "Movimiento no es borrador" |
| Stock suficiente | Salida, Transferencia | Error 422: "Stock insuficiente para ítem {x}" |

## No Changes Required

Esta feature no requiere:
- ❌ Nuevas tablas
- ❌ Nuevos campos en tablas existentes
- ❌ Migraciones de base de datos
- ❌ Cambios a índices o constraints

Toda la funcionalidad se implementa usando el modelo de datos existente.
