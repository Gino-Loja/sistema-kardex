# Research: Movimiento de Entrada Automático al Asignar Items

**Feature**: `006-item-assign-entry`
**Date**: 2026-01-19

## Decision 1: Reutilizar Servicios Existentes vs Lógica Nueva

### Decision
Reutilizar los servicios existentes `createMovement` y `publicarMovimiento` en lugar de crear lógica nueva para insertar directamente en las tablas.

### Rationale
1. **Consistencia**: Los movimientos creados automáticamente siguen exactamente el mismo flujo que los manuales
2. **Mantenibilidad**: Cualquier cambio futuro en la lógica de movimientos se aplica automáticamente
3. **Auditoría**: Se aprovecha el sistema de auditoría existente en `publicarMovimiento`
4. **Cálculo de costos**: `WeightedAverageService` ya maneja correctamente el promedio ponderado
5. **Validaciones**: Las validaciones existentes (stock, bodega activa, etc.) se aplican automáticamente

### Alternatives Considered
| Alternativa | Rechazada porque |
|-------------|------------------|
| Insertar directamente en tablas `movimientos` y `detalle_movimientos` | Duplicaría lógica, riesgo de inconsistencias, no ejecutaría el servicio de promedio ponderado |
| Crear nuevo servicio específico para asignación inicial | Overhead innecesario, los servicios existentes cubren el caso de uso |

---

## Decision 2: Transacción Atómica con Drizzle

### Decision
Envolver toda la operación (crear `item_bodegas` + crear movimiento + publicar movimiento) en una única transacción Drizzle.

### Rationale
1. **Atomicidad**: FR-011 requiere que si cualquier item falla, ninguno se asigne
2. **Consistencia**: Evita estados parciales donde hay registros en `item_bodegas` sin movimiento correspondiente
3. **Rollback automático**: Drizzle maneja el rollback si hay cualquier error

### Implementation Pattern
```typescript
await db.transaction(async (tx) => {
  // 1. Crear registros item_bodegas
  // 2. Crear movimiento borrador
  // 3. Publicar movimiento
  // Si cualquier paso falla, todo se revierte
});
```

### Alternatives Considered
| Alternativa | Rechazada porque |
|-------------|------------------|
| Operaciones secuenciales sin transacción | Riesgo de estados inconsistentes si falla a mitad |
| Saga pattern con compensación | Overengineering para este caso de uso |

---

## Decision 3: Estructura del Input API

### Decision
Extender el body del endpoint POST `/api/bodegas/:id/items` para aceptar un array de objetos con stock y costo opcionales.

### Rationale
1. **Backwards compatible**: `itemIds: string[]` sigue funcionando (stock=0, costo=0 por defecto)
2. **Flexible**: Permite asignar items con o sin stock inicial en la misma operación
3. **Validación clara**: Zod permite definir reglas de validación por item

### Schema Propuesto
```typescript
const assignItemsSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().uuid(),
    stockInicial: z.number().min(0).optional().default(0),
    costoUnitario: z.number().min(0).optional().default(0),
  })).min(1).max(50),
});
```

### Alternatives Considered
| Alternativa | Rechazada porque |
|-------------|------------------|
| Campos separados `itemIds`, `stocks`, `costos` (arrays paralelos) | Error-prone, difícil de validar correspondencia |
| Dos endpoints separados (sin stock vs con stock) | Duplicación de código, confuso para el frontend |

---

## Decision 4: Movimiento Único con Múltiples Detalles

### Decision
Cuando se asignan múltiples items con stock > 0, crear un único movimiento con múltiples líneas de detalle (no un movimiento por item).

### Rationale
1. **Clarificación del spec**: La sesión de clarificación definió explícitamente "un solo movimiento con múltiples líneas de detalle"
2. **Eficiencia**: Menos registros en `movimientos`, mejor rendimiento en consultas
3. **Auditoría**: Un solo movimiento representa una sola operación de usuario
4. **Consistencia**: Si algún item falla, el movimiento completo no se crea

### Implementation
```typescript
// Filtrar items con stock > 0
const itemsConStock = items.filter(i => i.stockInicial > 0);

if (itemsConStock.length > 0) {
  // Un solo movimiento con N detalles
  const movimiento = await createMovement({
    tipo: "entrada",
    bodegaDestinoId: bodegaId,
    detalles: itemsConStock.map(i => ({
      itemId: i.itemId,
      cantidad: i.stockInicial,
      costoUnitario: i.costoUnitario,
    })),
    observacion: "Entrada inicial por asignación de items a bodega",
  }, usuarioId);

  await publicarMovimiento({ movimientoId: movimiento.id, usuarioId });
}
```

---

## Decision 5: Manejo de Items sin Stock

### Decision
Items con `stockInicial = 0` o sin especificar se asignan a la bodega pero NO generan movimiento de entrada.

### Rationale
1. **FR-005**: "El sistema NO DEBE crear movimientos de entrada cuando stock_inicial = 0"
2. **Caso de uso válido**: Preparar bodega para futuras entradas sin contaminar historial
3. **Consistencia con spec**: User Story 3 especifica este comportamiento

### Implementation
```typescript
// Siempre crear registros item_bodegas
await Promise.all(items.map(i =>
  itemBodegasRepository.crear({
    itemId: i.itemId,
    bodegaId,
    stockActual: i.stockInicial || 0,
    costoPromedio: i.costoUnitario || 0,
  })
));

// Solo crear movimiento para items con stock > 0
const itemsConStock = items.filter(i => (i.stockInicial || 0) > 0);
if (itemsConStock.length > 0) {
  // Crear y publicar movimiento...
}
```

---

## Decision 6: Observación del Movimiento

### Decision
El movimiento automático tendrá una observación estándar que lo identifica como entrada inicial.

### Rationale
1. **Trazabilidad**: Permite identificar movimientos automáticos vs manuales
2. **Auditoría**: Facilita debugging y reportes
3. **UX**: El usuario puede ver en el historial que fue una asignación inicial

### Valor
```
"Entrada inicial por asignación de items a bodega"
```

---

## Decision 7: Validación de Duplicados

### Decision
Validar ANTES de iniciar la transacción que ningún item está ya asignado a la bodega.

### Rationale
1. **FR-011**: Transacción atómica - si un item está duplicado, ninguno se asigna
2. **Mejor UX**: Error claro al usuario indicando qué items ya están asignados
3. **Eficiencia**: Evita iniciar transacción que va a fallar

### Implementation
```typescript
// Antes de la transacción
const existentes = await itemBodegasRepository.buscarPorBodegaEItems(
  bodegaId,
  items.map(i => i.itemId)
);

if (existentes.length > 0) {
  throw new Error(`Items ya asignados: ${existentes.map(e => e.itemId).join(", ")}`);
}

// Luego iniciar transacción...
```

---

## Decision 8: Respuesta del Endpoint

### Decision
El endpoint retorna información sobre los items asignados y opcionalmente el ID del movimiento creado.

### Rationale
1. **Información completa**: El frontend puede mostrar confirmación detallada
2. **Navegación**: Con el `movimientoId` el usuario puede ir al kardex directamente
3. **Debugging**: Facilita troubleshooting si hay problemas

### Response Schema
```typescript
{
  success: true,
  data: {
    assigned: string[],           // IDs de items asignados
    movimientoId: string | null,  // null si ningún item tenía stock > 0
    message: string               // Mensaje descriptivo
  }
}
```

---

## Technical Findings

### Servicios Existentes Confirmados

| Servicio | Ubicación | Uso |
|----------|-----------|-----|
| `createMovement` | `src/lib/data/movements.ts` | Crear movimiento borrador |
| `publicarMovimiento` | `src/lib/dal/services/movements.service.ts` | Publicar y ejecutar weighted average |
| `WeightedAverageService` | `src/lib/dal/services/weighted-average.service.ts` | Cálculo interno (llamado por publicar) |
| `itemBodegasRepository` | `src/lib/dal/repositories/item-bodegas.repository.ts` | CRUD item_bodegas |
| `bodegasRepository` | `src/lib/dal/repositories/bodegas.repository.ts` | Verificar estado bodega |

### Esquemas de BD Confirmados

| Tabla | Campo Relevante | Uso |
|-------|-----------------|-----|
| `bodegas` | `auto_update_average_cost` | Determina si actualizar costo promedio |
| `bodegas` | `estado` | Validar bodega activa |
| `item_bodegas` | `stockActual`, `costoPromedio` | Actualizados por el servicio |
| `movimientos` | `tipo="entrada"`, `estado="publicado"` | Movimiento creado automáticamente |
| `detalle_movimientos` | `cantidad`, `costoUnitario` | Detalles del movimiento |

### Validaciones Existentes a Aprovechar

1. **UUID válido**: Zod valida formato de IDs
2. **Bodega existe**: `bodegasRepository.obtenerPorId` lanza error si no existe
3. **Item existe**: Validación implícita al crear `item_bodegas` (FK constraint)
4. **Stock no negativo**: Zod `z.number().min(0)`
5. **Costo no negativo**: Zod `z.number().min(0)`
