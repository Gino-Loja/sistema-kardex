# Data Model: Movimiento de Entrada Automático al Asignar Items

**Feature**: `006-item-assign-entry`
**Date**: 2026-01-19

## Entities Overview

Esta feature no crea nuevas entidades, sino que extiende el comportamiento de las existentes. Las entidades involucradas son:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Bodega    │────<│  ItemBodega  │>────│       Item          │
└─────────────┘     └──────────────┘     └─────────────────────┘
       │                   │
       │                   │ (new relationship)
       │                   ▼
       │           ┌──────────────────┐     ┌─────────────────────┐
       └──────────>│   Movimiento     │────<│  DetalleMovimiento  │
                   └──────────────────┘     └─────────────────────┘
```

## Entity: ItemBodega (Existente)

**Purpose**: Representa la relación entre un item y una bodega, incluyendo stock y costo promedio.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| itemId | UUID | FK → items.id, NOT NULL | Item asignado |
| bodegaId | UUID | FK → bodegas.id, NOT NULL | Bodega destino |
| stockActual | NUMERIC(14,4) | NOT NULL, DEFAULT 0 | Cantidad disponible |
| costoPromedio | NUMERIC(14,4) | NOT NULL, DEFAULT 0 | Costo promedio ponderado |
| valorTotal | NUMERIC(14,4) | COMPUTED | stockActual * costoPromedio |
| stockMinimo | NUMERIC(14,4) | DEFAULT 0 | Nivel mínimo de stock |
| stockMaximo | NUMERIC(14,4) | DEFAULT 0 | Nivel máximo de stock |
| creadoEn | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |
| actualizadoEn | TIMESTAMP | NOT NULL | Última actualización |

### Constraints

- **UNIQUE(itemId, bodegaId)**: Un item solo puede estar asignado una vez a cada bodega
- **FK itemId**: Referencia a tabla `items`
- **FK bodegaId**: Referencia a tabla `bodegas`

### Indexes

- `item_bodega_item_idx` ON (itemId)
- `item_bodega_bodega_idx` ON (bodegaId)
- `item_bodega_unique_idx` ON (itemId, bodegaId) UNIQUE

---

## Entity: Movimiento (Existente)

**Purpose**: Representa una operación de inventario (entrada, salida, transferencia, ajuste).

### Fields Relevantes para esta Feature

| Field | Type | Constraints | Uso en esta Feature |
|-------|------|-------------|---------------------|
| id | UUID | PK | Identificador del movimiento creado |
| tipo | ENUM | NOT NULL | **"entrada"** para asignación inicial |
| subTipo | ENUM | NULLABLE | null (no aplica para asignación inicial) |
| estado | ENUM | NOT NULL | **"publicado"** (se publica automáticamente) |
| fecha | TIMESTAMP | NOT NULL | Fecha actual de la asignación |
| bodegaDestinoId | UUID | FK → bodegas.id | Bodega donde se asignan los items |
| bodegaOrigenId | UUID | NULLABLE | null (no aplica para entrada) |
| terceroId | UUID | NULLABLE | null (no aplica para asignación inicial) |
| usuarioId | UUID | FK → users.id, NOT NULL | Usuario que realiza la asignación |
| observacion | TEXT | NULLABLE | "Entrada inicial por asignación de items a bodega" |
| version | NUMERIC | NOT NULL, DEFAULT 1 | Control de concurrencia |

### State Transitions

```
[NUEVO] ──create──> [borrador] ──publicar──> [publicado]
                                    │
                                    └─> (automático en esta feature)
```

Para esta feature, el movimiento se crea y publica en una sola operación atómica.

---

## Entity: DetalleMovimiento (Existente)

**Purpose**: Representa cada línea de un movimiento, asociando item, cantidad y costo.

### Fields

| Field | Type | Constraints | Uso en esta Feature |
|-------|------|-------------|---------------------|
| id | UUID | PK | Identificador único |
| movimientoId | UUID | FK → movimientos.id, NOT NULL | Movimiento padre |
| itemId | UUID | FK → items.id, NOT NULL | Item siendo asignado |
| cantidad | NUMERIC(14,4) | NOT NULL, > 0 | Stock inicial del item |
| costoUnitario | NUMERIC(14,4) | NOT NULL, >= 0 | Costo unitario inicial |
| costoTotal | NUMERIC(14,4) | COMPUTED | cantidad * costoUnitario |

### Relationship to Movimiento

- **1 Movimiento : N DetalleMovimiento**
- Para asignación múltiple: UN movimiento con múltiples detalles

---

## Entity: Bodega (Existente)

**Purpose**: Almacén donde se almacenan items.

### Fields Relevantes para esta Feature

| Field | Type | Constraints | Uso en esta Feature |
|-------|------|-------------|---------------------|
| id | UUID | PK | Identificador de la bodega |
| estado | ENUM | NOT NULL | Debe ser **"activo"** para asignar items |
| auto_update_average_cost | BOOLEAN | DEFAULT false | Determina si se actualiza costo promedio |

### Validation Rules

- Solo se pueden asignar items a bodegas con `estado = "activo"`
- Si `auto_update_average_cost = true`, el costo promedio se recalcula al publicar movimiento

---

## Input Data Model: AssignItemInput

**Purpose**: Define la estructura de datos que recibe el endpoint de asignación.

### Schema (Zod)

```typescript
const assignItemInputSchema = z.object({
  itemId: z.string().uuid("ID de item debe ser UUID válido"),
  stockInicial: z.number()
    .min(0, "Stock inicial no puede ser negativo")
    .optional()
    .default(0),
  costoUnitario: z.number()
    .min(0, "Costo unitario no puede ser negativo")
    .optional()
    .default(0),
});

const assignItemsRequestSchema = z.object({
  items: z.array(assignItemInputSchema)
    .min(1, "Debe incluir al menos un item")
    .max(50, "Máximo 50 items por operación"),
});
```

### TypeScript Type

```typescript
interface AssignItemInput {
  itemId: string;
  stockInicial?: number;  // default: 0
  costoUnitario?: number; // default: 0
}

interface AssignItemsRequest {
  items: AssignItemInput[];
}
```

---

## Output Data Model: AssignItemsResponse

**Purpose**: Define la estructura de respuesta del endpoint de asignación.

### TypeScript Type

```typescript
interface AssignItemsResponse {
  success: true;
  data: {
    assigned: string[];           // IDs de items asignados exitosamente
    movimientoId: string | null;  // ID del movimiento creado (null si todos stock=0)
    message: string;              // Mensaje descriptivo
  };
}

interface AssignItemsErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      itemsYaAsignados?: string[];    // IDs de items duplicados
      bodegaInactiva?: boolean;       // Si la bodega no está activa
      itemsInexistentes?: string[];   // IDs de items que no existen
    };
  };
}
```

---

## Data Flow

### Creación de ItemBodega + Movimiento

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACCIÓN ATÓMICA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Validar items no duplicados                                 │
│     ├─ Query: SELECT * FROM item_bodegas                        │
│     │         WHERE bodega_id = ? AND item_id IN (?, ?, ...)    │
│     └─ Si hay resultados → ERROR "Items ya asignados"           │
│                                                                 │
│  2. Validar bodega activa                                       │
│     ├─ Query: SELECT estado FROM bodegas WHERE id = ?           │
│     └─ Si estado != "activo" → ERROR "Bodega inactiva"          │
│                                                                 │
│  3. Crear registros item_bodegas                                │
│     └─ INSERT INTO item_bodegas (item_id, bodega_id,            │
│               stock_actual, costo_promedio, ...)                │
│        VALUES (?, ?, ?, ?, ...) × N items                       │
│                                                                 │
│  4. Si hay items con stock > 0:                                 │
│     │                                                           │
│     ├─ 4a. Crear movimiento borrador                            │
│     │   └─ INSERT INTO movimientos (tipo, estado, ...)          │
│     │      VALUES ('entrada', 'borrador', ...)                  │
│     │                                                           │
│     ├─ 4b. Crear detalles del movimiento                        │
│     │   └─ INSERT INTO detalle_movimientos                      │
│     │      (movimiento_id, item_id, cantidad, costo_unitario)   │
│     │      VALUES (?, ?, ?, ?) × N items con stock > 0          │
│     │                                                           │
│     └─ 4c. Publicar movimiento                                  │
│         ├─ UPDATE movimientos SET estado = 'publicado'          │
│         └─ WeightedAverageService.updateStockAndAverageCost()   │
│             └─ UPDATE item_bodegas                              │
│                SET stock_actual = ?, costo_promedio = ?         │
│                WHERE item_id = ? AND bodega_id = ?              │
│                                                                 │
│  5. COMMIT                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Rules Summary

| Rule | Entity | Field | Validation |
|------|--------|-------|------------|
| VR-001 | AssignItemInput | itemId | UUID válido, item debe existir |
| VR-002 | AssignItemInput | stockInicial | >= 0 |
| VR-003 | AssignItemInput | costoUnitario | >= 0 |
| VR-004 | ItemBodega | (itemId, bodegaId) | Combinación única |
| VR-005 | Bodega | estado | Debe ser "activo" |
| VR-006 | AssignItemsRequest | items | 1 <= length <= 50 |

---

## Impact on Existing Data

### No Schema Changes Required

Esta feature **no requiere cambios de esquema** en la base de datos. Todas las tablas y columnas necesarias ya existen:

- `item_bodegas`: Tabla existente con todos los campos necesarios
- `movimientos`: Tabla existente con tipo "entrada" soportado
- `detalle_movimientos`: Tabla existente con relación a movimientos
- `bodegas.auto_update_average_cost`: Campo ya existe

### Migration Strategy

No se requiere migración de datos. Los datos existentes en `item_bodegas` (asignaciones previas sin movimiento) no serán modificados según el spec (Out of Scope).
