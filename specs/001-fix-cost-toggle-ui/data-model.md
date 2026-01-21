# Data Model: Corregir Toggle de Actualización Automática de Costo Promedio

**Branch**: `001-fix-cost-toggle-ui`
**Date**: 2026-01-19

## Entidades Existentes (Sin Cambios)

Esta feature no introduce cambios en el modelo de datos. Solo corrige la comunicación entre el frontend y el backend existente.

### Bodega

La entidad Bodega ya existe con el campo `auto_update_average_cost`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| identificacion | string | Código de identificación |
| nombre | string | Nombre de la bodega |
| ubicacion | string? | Ubicación física |
| **auto_update_average_cost** | boolean | Controla si el costo promedio se actualiza automáticamente |
| estado | enum | Estado (activo/inactivo) |

## Schema de Validación (Existente)

**Archivo**: `src/lib/validations/masters.ts`

```typescript
export const bodegaUpdateSchema = z.object({
  id: idSchema,
  identificacion: nonEmptyStringSchema.optional(),
  nombre: nonEmptyStringSchema.optional(),
  ubicacion: nonEmptyStringSchema.optional(),
  auto_update_average_cost: z.boolean().optional(),  // ← Campo esperado
  estado: estadoSchema.optional(),
});
```

## Mapeo Frontend → Backend

| Frontend (Actual) | Backend (Esperado) | Acción |
|-------------------|-------------------|--------|
| `autoUpdateAverageCost` | `auto_update_average_cost` | Corregir nombre |

## Conclusión

No se requieren migraciones ni cambios en la base de datos. El modelo de datos ya está correctamente definido; solo falta alinear el frontend con la convención de nombres del backend (snake_case).
