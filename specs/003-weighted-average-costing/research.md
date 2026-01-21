# Research: Método de Valoración Promedio Ponderado

**Feature**: 003-weighted-average-costing
**Date**: 2026-01-16

## 1. Fórmula del Promedio Ponderado

### Decision
Usar la fórmula estándar contable:
```
Nuevo Costo Promedio = (Valor Existencia Actual + Valor Nueva Entrada) / (Cantidad Existencia + Cantidad Entrada)
```

Donde:
- `Valor Existencia Actual = Cantidad Existencia × Costo Promedio Actual`
- `Valor Nueva Entrada = Cantidad Entrada × Costo Unitario Entrada`

### Rationale
Esta fórmula es el estándar contable para el método de promedio ponderado (weighted average cost method), también conocido como método de costo promedio móvil. Se recalcula solo en entradas porque:
1. Las compras introducen nuevo costo al inventario
2. Las salidas retiran inventario al costo promedio existente (no introducen nuevo costo)
3. Las devoluciones en venta reintegran al mismo costo promedio (no cambia)
4. Las devoluciones en compra retiran al costo promedio (no cambia)

### Alternatives Considered
- **FIFO (First In, First Out)**: Más complejo, requiere rastrear lotes individuales. Rechazado por simplicidad.
- **LIFO (Last In, First Out)**: No permitido bajo IFRS en muchos países. Rechazado.
- **Costo específico**: Impráctico para ítems fungibles. Rechazado.

---

## 2. Precisión Decimal

### Decision
Usar `NUMERIC(14,4)` para todos los campos de costo y cantidad.

### Rationale
- 14 dígitos totales permiten valores hasta $9,999,999,999.9999
- 4 decimales son suficientes para cálculos financieros precisos
- Consistente con el schema existente de `itemBodegas` y `detalleMovimientos`
- El redondeo se aplica solo al final del cálculo, no en pasos intermedios

### Alternatives Considered
- **NUMERIC(10,2)**: Solo 2 decimales, insuficiente para cálculos intermedios
- **FLOAT/DOUBLE**: Problemas de precisión en operaciones financieras
- **INTEGER (centavos)**: Requiere conversión constante, propenso a errores

---

## 3. Momento de Recálculo

### Decision
Recalcular el costo promedio **solo al publicar** un movimiento de tipo entrada-compra.

### Rationale
- Los borradores no afectan inventario ni costos
- Publicar es la acción que confirma el movimiento contable
- Permite corregir errores antes de impactar el sistema
- Consistente con el flujo de estados existente (borrador → publicado)

### Alternatives Considered
- **Recálculo en tiempo real**: Demasiado costoso computacionalmente
- **Recálculo al crear**: Afectaría borradores, inconsistente con modelo actual
- **Recálculo batch nocturno**: Latencia inaceptable para consulta de Kárdex en tiempo real

---

## 4. Granularidad del Costo Promedio

### Decision
Mantener costo promedio por combinación **ítem + bodega**.

### Rationale
- Cada bodega puede tener diferentes costos de adquisición
- Permite transferencias entre bodegas con diferentes promedios
- El schema actual de `itemBodegas` ya soporta esta granularidad
- Consistente con el modelo de inventario multi-bodega

### Alternatives Considered
- **Costo único por ítem (global)**: Ignora diferencias entre bodegas, menos preciso
- **Costo por lote**: Demasiado complejo para promedio ponderado

---

## 5. Estructura de Tabla de Auditoría

### Decision
Crear tabla `auditoria_costo_promedio` con campos:
- `id`: Identificador único
- `itemBodegaId`: FK a item_bodegas
- `movimientoId`: FK al movimiento que causó el cambio
- `costoAnterior`: NUMERIC(14,4)
- `costoNuevo`: NUMERIC(14,4)
- `cantidadAnterior`: NUMERIC(14,4)
- `cantidadNueva`: NUMERIC(14,4)
- `usuarioId`: FK al usuario que publicó
- `fecha`: Timestamp del cambio

### Rationale
- Permite auditoría completa de cambios de costo
- Vincula cada cambio al movimiento que lo causó
- Registra tanto cantidad como costo para reconstruir cálculos
- Consistente con el patrón de auditoría existente (audit-log.service.ts)

### Alternatives Considered
- **Usar tabla audit_logs genérica**: Menos estructurado, difícil de consultar
- **Log en archivo**: No consultable desde UI, difícil de correlacionar
- **Sin auditoría**: Violación de FR-015

---

## 6. Patrón de Exportación CSV

### Decision
Reutilizar el patrón existente de `src/lib/queries/csv.ts` con la función `formatCsv()`.

### Rationale
- Patrón probado en `kardex-export.ts` y `catalog-export.ts`
- Maneja correctamente escape de caracteres especiales
- Consistente con el código existente

### Implementation Notes
```typescript
const headers = [
  "Fecha", "Detalle", "N° Doc",
  "Entrada Cant", "Entrada P.U.", "Entrada Valor",
  "Salida Cant", "Salida P.U.", "Salida Valor",
  "Exist. Cant", "Exist. P.U.", "Exist. Valor"
];
```

---

## 7. Estructura de Vista Kárdex

### Decision
Crear endpoint API `/api/kardex` que retorne datos procesados estilo Tarjeta Kárdex.

### Rationale
La vista Kárdex requiere cálculos sobre los movimientos:
- Calcular existencias acumuladas (running total)
- Mostrar costo promedio en cada punto del tiempo
- Ordenar cronológicamente

Esta lógica es más eficiente ejecutarla en el servidor que en el cliente.

### Response Structure
```typescript
type KardexRow = {
  fecha: Date;
  detalle: string;
  numeroDocumento: string | null;
  entrada: { cantidad: number; precioUnitario: number; valor: number } | null;
  salida: { cantidad: number; precioUnitario: number; valor: number } | null;
  existencia: { cantidad: number; costoPromedio: number; valor: number };
};
```

---

## 8. Manejo de Transferencias

### Decision
En transferencias:
1. Bodega origen: Registrar salida al costo promedio actual (NO recalcula)
2. Bodega destino: Registrar entrada al costo promedio de origen (SÍ recalcula)

### Rationale
- No se introduce nuevo costo al sistema, solo se mueve
- El costo total del sistema se mantiene constante (sin ganancia/pérdida ficticia)
- El destino recalcula porque recibe mercancía con un costo específico (el del origen)

### Formula for Destination
```
Nuevo Costo Destino = (Valor Existencia Destino + (Cantidad Transfer × Costo Origen))
                      / (Cantidad Destino + Cantidad Transfer)
```

---

## 9. Manejo de Stock Cero

### Decision
Cuando el stock llega a cero:
1. El costo promedio se mantiene en el último valor calculado
2. La siguiente entrada establece el nuevo promedio (sin promediar con cero)

### Rationale
- `0 × costoPromedio = 0`, por lo que la fórmula funciona naturalmente
- `(0 + ValorEntrada) / (0 + CantidadEntrada) = CostoUnitarioEntrada`
- No se pierde el histórico del costo promedio anterior (queda en auditoría)

---

## 10. Validación de Stock

### Decision
Validar stock suficiente ANTES de publicar movimientos de salida o devolución en compra.

### Rationale
- Previene stock negativo
- Consistente con validación existente en `validateStock()`
- El error se muestra antes de intentar el cálculo

### Error Message
```
"Stock insuficiente. Disponible: {cantidad} unidades en bodega {nombre}"
```

---

## Technology Best Practices Applied

### Drizzle ORM
- Usar transacciones para operaciones atómicas (actualizar stock + costo + auditoría)
- Índices en `itemBodegaId` y `fecha` para queries de Kárdex

### Zod Validation
- Reutilizar `paginationSchema` para consulta de Kárdex
- Agregar validación de rango de fechas

### React Query
- Usar `useQuery` para datos de Kárdex con cache
- Invalidar cache al publicar movimientos

### API Routes
- Usar Response streaming para exportación CSV de grandes volúmenes
- Retornar headers adecuados: `Content-Type: text/csv`, `Content-Disposition: attachment`
