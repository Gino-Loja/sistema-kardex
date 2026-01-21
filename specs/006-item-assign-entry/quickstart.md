# Quickstart: Movimiento de Entrada Automático al Asignar Items

**Feature**: `006-item-assign-entry`
**Branch**: `006-item-assign-entry`

## Overview

Esta feature modifica el flujo de asignación de items a bodegas para crear automáticamente un movimiento de entrada cuando se asigna un item con stock inicial > 0.

## Prerequisites

- Node.js 20.x
- PostgreSQL running
- Proyecto clonado y dependencias instaladas (`npm install`)
- Base de datos migrada (`npm run db:migrate`)

## Quick Test

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Probar asignación con stock inicial (via cURL)

```bash
# Asignar item con stock inicial
curl -X POST http://localhost:3000/api/bodegas/70280634-0dd5-4e93-a1d7-a962ef1fe295/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "items": [
      {
        "itemId": "efaffb8f-cf83-4798-bd06-ad3996a8c515",
        "stockInicial": 15,
        "costoUnitario": 72.67
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "assigned": ["efaffb8f-cf83-4798-bd06-ad3996a8c515"],
    "movimientoId": "abc123...",
    "message": "1 item asignado. Movimiento de entrada creado y publicado."
  }
}
```

### 3. Verificar en el Kardex

Navegar a:
```
http://localhost:3000/kardex?itemId=efaffb8f-cf83-4798-bd06-ad3996a8c515
```

Debería mostrar:
- Total Entradas: $1,090.05 (15 × 72.67)
- Existencia Final: 15
- Costo Promedio: $72.67

## Key Files

| Archivo | Descripción |
|---------|-------------|
| `src/lib/data/item-bodegas.ts` | Lógica principal de asignación |
| `src/lib/validators/item-bodega.ts` | Validación Zod del input |
| `src/app/api/bodegas/[id]/items/route.ts` | Endpoint POST |
| `src/lib/dal/services/movements.service.ts` | Servicio de publicación (existente) |

## Testing

```bash
# Ejecutar tests unitarios
npm run test -- --filter="item-bodegas"

# Ejecutar tests específicos de esta feature
npm run test -- --filter="assignItemsToBodega"
```

## Common Scenarios

### Scenario 1: Asignar múltiples items con stock

```bash
curl -X POST http://localhost:3000/api/bodegas/{bodegaId}/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "itemId": "item-1-uuid", "stockInicial": 10, "costoUnitario": 50 },
      { "itemId": "item-2-uuid", "stockInicial": 20, "costoUnitario": 75 },
      { "itemId": "item-3-uuid", "stockInicial": 5, "costoUnitario": 100 }
    ]
  }'
```

**Result:** UN movimiento con 3 líneas de detalle.

### Scenario 2: Asignar item sin stock (solo relación)

```bash
curl -X POST http://localhost:3000/api/bodegas/{bodegaId}/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "itemId": "item-uuid" }
    ]
  }'
```

**Result:** Item asignado a bodega, sin movimiento creado.

### Scenario 3: Error - Item ya asignado

```bash
# Intentar asignar un item que ya existe en la bodega
curl -X POST http://localhost:3000/api/bodegas/{bodegaId}/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "itemId": "item-ya-asignado-uuid", "stockInicial": 10, "costoUnitario": 50 }
    ]
  }'
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "ITEMS_ALREADY_ASSIGNED",
    "message": "Algunos items ya están asignados a esta bodega",
    "details": {
      "itemsYaAsignados": ["item-ya-asignado-uuid"]
    }
  }
}
```

## Troubleshooting

### El kardex no muestra el stock asignado

1. Verificar que el item tenga `stockInicial > 0` en la asignación
2. Verificar que el movimiento se creó: buscar en `/api/movements?bodegaId={bodegaId}`
3. Verificar que el movimiento tiene `estado: "publicado"`

### Error "Bodega inactiva"

La bodega debe tener `estado: "activo"`. Verificar en:
```
http://localhost:3000/bodegas/{bodegaId}
```

### Error de transacción

Si hay errores parciales, verificar los logs del servidor. La transacción es atómica: si falla, no se guarda nada.

## Architecture Notes

```
POST /api/bodegas/:id/items
        │
        ▼
  assignItemsToBodega()
        │
        ├─── Validar input (Zod)
        ├─── Verificar duplicados
        ├─── Verificar bodega activa
        │
        └─── [TRANSACTION]
                │
                ├─── Crear item_bodegas records
                │
                └─── Si stock > 0:
                        │
                        ├─── createMovement() (borrador)
                        └─── publicarMovimiento()
                                │
                                └─── WeightedAverageService
                                        │
                                        └─── UPDATE item_bodegas
                                              (stock, costoPromedio)
```

## Related Documentation

- [Spec](./spec.md) - Especificación funcional
- [Plan](./plan.md) - Plan de implementación
- [Research](./research.md) - Decisiones técnicas
- [Data Model](./data-model.md) - Modelo de datos
- [API Contract](./contracts/assign-items.yaml) - OpenAPI spec
