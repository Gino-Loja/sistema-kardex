# API Contract: PATCH /api/bodegas/{id}

**Branch**: `001-fix-cost-toggle-ui`
**Date**: 2026-01-19

## Endpoint Existente

Este contrato documenta el endpoint existente que el componente debe usar correctamente.

### Request

```
PATCH /api/bodegas/{id}
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | ID de la bodega |

#### Request Body

```json
{
  "auto_update_average_cost": boolean  // ← Nombre correcto del campo
}
```

**Nota**: El campo debe enviarse como `auto_update_average_cost` (snake_case), no `autoUpdateAverageCost` (camelCase).

### Responses

#### 200 OK - Éxito

```json
{
  "id": "uuid",
  "identificacion": "string",
  "nombre": "string",
  "ubicacion": "string | null",
  "auto_update_average_cost": boolean,
  "estado": "activo | inactivo"
}
```

#### 400 Bad Request - Sin cambios

```json
{
  "error": "NO_CHANGES"
}
```

**Causa**: Se envía un body vacío o con campos no reconocidos por el schema.

#### 400 Bad Request - Error de validación

```json
{
  "error": "VALIDATION_ERROR"
}
```

#### 401 Unauthorized

```json
{
  "error": "UNAUTHENTICATED"
}
```

#### 403 Forbidden

```json
{
  "error": "FORBIDDEN"
}
```

**Nota**: Solo usuarios con rol `admin` pueden modificar bodegas.

#### 404 Not Found

```json
{
  "error": "NOT_FOUND"
}
```

## Validación del Schema

El endpoint usa `bodegaPatchSchema` que deriva de `bodegaUpdateSchema`:

```typescript
// src/lib/validators/bodega.ts
export const bodegaPatchSchema = bodegaUpdateSchema.omit({ id: true })

// src/lib/validations/masters.ts
export const bodegaUpdateSchema = z.object({
  id: idSchema,
  identificacion: nonEmptyStringSchema.optional(),
  nombre: nonEmptyStringSchema.optional(),
  ubicacion: nonEmptyStringSchema.optional(),
  auto_update_average_cost: z.boolean().optional(),
  estado: estadoSchema.optional(),
});
```

## Ejemplo de Uso Correcto

```typescript
const response = await fetch(`/api/bodegas/${warehouseId}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ auto_update_average_cost: true }),
});
```
