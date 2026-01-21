# Data Model: Gestión de Movimientos CRUD

**Feature**: 001-movements-crud
**Date**: 2026-01-14

## Entities

### Movimiento (Existing Table)

**Purpose**: Represents an inventory transaction (input, output, or transfer)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| tipo | Enum | Yes | "entrada" \| "salida" \| "transferencia" |
| estado | Enum | Yes | "borrador" \| "publicado" \| "anulado" (default: borrador) |
| fecha | Timestamp | Yes | Movement date (default: now) |
| bodegaOrigenId | UUID | Conditional | Required for salida, transferencia |
| bodegaDestinoId | UUID | Conditional | Required for entrada, transferencia |
| terceroId | UUID | No | Related vendor/customer |
| usuarioId | UUID | Yes | User who created the movement |
| observacion | Text | No | Notes/comments |
| documentoReferencia | Text | No | External document reference |
| creadoEn | Timestamp | Yes | Creation timestamp |
| actualizadoEn | Timestamp | Yes | Last update timestamp |

**Note**: `documentoReferencia` field needs to be added to schema if not present.

### DetalleMovimiento (Existing Table)

**Purpose**: Line items for a movement (one-to-many relationship)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| movimientoId | UUID | Yes | FK to movimientos |
| itemId | UUID | Yes | FK to items |
| cantidad | Numeric(18,4) | Yes | Quantity |
| costoUnitario | Numeric(18,4) | No | Unit cost |
| costoTotal | Numeric(18,4) | No | Calculated: cantidad × costoUnitario |

## Relationships

```
┌─────────────┐       ┌──────────────────┐       ┌────────┐
│  Movimiento │──1:N──│ DetalleMovimiento│──N:1──│  Item  │
└─────────────┘       └──────────────────┘       └────────┘
      │
      │ N:1 (bodegaOrigenId)
      │ N:1 (bodegaDestinoId)
      ▼
┌─────────────┐
│   Bodega    │
└─────────────┘

┌─────────────┐       ┌─────────────┐
│  Movimiento │──N:1──│   Tercero   │
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐
│  Movimiento │──N:1──│   Usuario   │
└─────────────┘       └─────────────┘
```

## Validation Rules

### Movimiento

1. **Tipo-based bodega requirements**:
   - `entrada`: bodegaDestinoId required, bodegaOrigenId must be null
   - `salida`: bodegaOrigenId required, bodegaDestinoId must be null
   - `transferencia`: both bodegaOrigenId and bodegaDestinoId required

2. **Transferencia validation**:
   - bodegaOrigenId !== bodegaDestinoId

3. **Estado transitions**:
   - borrador → publicado (via publicar action)
   - publicado → anulado (via anular action)
   - No reverse transitions

4. **Edit/Delete restrictions**:
   - Only movements with estado="borrador" can be edited or deleted

### DetalleMovimiento

1. **Minimum items**: At least 1 detail line required per movement
2. **Quantity**: Must be positive (> 0)
3. **Cost**: costoUnitario can be 0 or null for non-valued movements

### Stock Validation (on publish, not on draft save)

1. **Salida**: cantidad <= stock disponible en bodegaOrigen
2. **Transferencia**: cantidad <= stock disponible en bodegaOrigen

## State Machine

```
┌──────────┐    publicar    ┌───────────┐    anular    ┌─────────┐
│ BORRADOR │───────────────►│ PUBLICADO │──────────────►│ ANULADO │
└──────────┘                └───────────┘               └─────────┘
     │
     │ eliminar
     ▼
  [DELETED]
```

**Actions by state**:
- BORRADOR: Create, Read, Update, Delete, Publicar
- PUBLICADO: Read, Anular
- ANULADO: Read only

## Indexes (Existing)

- `movimientos_estado_idx`: Filtering by status
- `movimientos_fecha_idx`: Date range queries
- `detalle_movimientos_movimiento_id_idx`: Line item lookups

## Sample Data Structure

```typescript
// Create Movement Request
{
  tipo: "entrada",
  fecha: "2026-01-14T10:00:00Z",
  bodegaDestinoId: "uuid-bodega",
  terceroId: "uuid-tercero",
  observacion: "Recepción de mercancía",
  documentoReferencia: "FAC-001",
  detalles: [
    { itemId: "uuid-item-1", cantidad: 10, costoUnitario: 100 },
    { itemId: "uuid-item-2", cantidad: 5, costoUnitario: 200 }
  ]
}

// Movement Response
{
  id: "uuid-movimiento",
  tipo: "entrada",
  estado: "borrador",
  fecha: "2026-01-14T10:00:00Z",
  bodegaOrigen: null,
  bodegaDestino: { id: "uuid", nombre: "Bodega Principal" },
  tercero: { id: "uuid", nombre: "Proveedor ABC" },
  usuario: { id: "uuid", name: "Admin" },
  observacion: "Recepción de mercancía",
  documentoReferencia: "FAC-001",
  detalles: [
    {
      id: "uuid-detalle-1",
      item: { id: "uuid", codigo: "SKU001", nombre: "Producto A" },
      cantidad: 10,
      costoUnitario: 100,
      costoTotal: 1000
    },
    // ...
  ],
  totalEstimado: 2000,
  creadoEn: "2026-01-14T10:00:00Z",
  actualizadoEn: "2026-01-14T10:00:00Z"
}
```
