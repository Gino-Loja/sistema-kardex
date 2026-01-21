# Data Model: Asignacion de items a bodega

## Entities

### Bodega
- **id**: identificador unico
- **nombre**: nombre visible
- **estado**: activa/inactiva

### Item
- **id**: identificador unico
- **nombre**: nombre visible
- **codigo**: identificador legible (SKU o codigo interno)
- **estado**: activo/inactivo

### ItemBodega (Asignacion)
- **id**: identificador unico de la asignacion
- **bodegaId**: referencia a Bodega
- **itemId**: referencia a Item
- **stockMinimo**: numero no negativo
- **stockActual**: numero no negativo
- **stockMaximo**: numero no negativo
- **costoPromedio**: numero no negativo
- **creadoEn**: marca de tiempo
- **actualizadoEn**: marca de tiempo

## Relationships
- Bodega 1..n ItemBodega
- Item 1..n ItemBodega
- ItemBodega pertenece a una Bodega y a un Item

## Validation Rules
- stockMinimo, stockActual, stockMaximo, costoPromedio deben ser >= 0.
- stockMaximo >= stockMinimo.
- Si se valida coherencia adicional: stockActual debe estar entre stockMinimo y stockMaximo cuando aplique.
- No se permite duplicar asignaciones activas del mismo Item a la misma Bodega.

## State Transitions
- **Asignar**: crear ItemBodega con valores iniciales.
- **Actualizar**: editar campos de stock/costo y actualizar marca de tiempo.
- **Eliminar**: remover la asignacion (baja del item en la bodega).
