# Quickstart: Método de Valoración Promedio Ponderado

**Feature**: 003-weighted-average-costing
**Date**: 2026-01-16

## Pre-requisitos

1. Base de datos PostgreSQL configurada
2. Migraciones ejecutadas (incluyendo las nuevas de esta feature)
3. Usuario con permisos `movements:read` y `movements:write`
4. Al menos una bodega y un ítem creados

## Setup Rápido

### 1. Ejecutar migraciones

```bash
npm run db:migrate
```

### 2. Verificar tablas

```sql
-- Verificar que existe la tabla de auditoría
SELECT * FROM auditoria_costo_promedio LIMIT 1;

-- Verificar campo sub_tipo en movimientos
SELECT id, tipo, sub_tipo, estado FROM movimientos LIMIT 5;
```

## Flujo de Prueba Manual

### Escenario 1: Inventario Inicial (Primera Entrada)

**Objetivo**: Verificar que la primera entrada establece el costo promedio inicial.

1. Crear movimiento de entrada:
   - Tipo: `entrada`
   - SubTipo: `compra`
   - Bodega destino: (seleccionar una)
   - Detalle: 120 unidades × $500.00

2. Publicar el movimiento

3. **Verificar**:
   - `itemBodegas.stockActual` = 120
   - `itemBodegas.costoPromedio` = 500.0000
   - Existe registro en `auditoria_costo_promedio`

### Escenario 2: Segunda Compra (Recálculo de Promedio)

**Objetivo**: Verificar la fórmula del promedio ponderado.

1. Crear movimiento de entrada:
   - Tipo: `entrada`
   - SubTipo: `compra`
   - Mismo ítem y bodega
   - Detalle: 60 unidades × $510.00

2. Publicar el movimiento

3. **Verificar cálculo**:
   ```
   Valor anterior: 120 × 500 = $60,000
   Valor entrada:  60 × 510 = $30,600
   Nueva cantidad: 120 + 60 = 180
   Nuevo promedio: ($60,000 + $30,600) / 180 = $503.33
   ```

4. **Verificar en BD**:
   - `itemBodegas.stockActual` = 180
   - `itemBodegas.costoPromedio` = 503.3333

### Escenario 3: Venta (Salida sin recálculo)

**Objetivo**: Verificar que las salidas usan el promedio actual sin modificarlo.

1. Crear movimiento de salida:
   - Tipo: `salida`
   - SubTipo: `venta`
   - Bodega origen: (la misma)
   - Detalle: 70 unidades

2. Publicar el movimiento

3. **Verificar**:
   - `itemBodegas.stockActual` = 110
   - `itemBodegas.costoPromedio` = 503.3333 (SIN CAMBIO)
   - `detalleMovimientos.costoUnitario` = 503.3333
   - `detalleMovimientos.costoTotal` = 35,233.31

### Escenario 4: Devolución en Venta

**Objetivo**: Verificar que las devoluciones de clientes no recalculan el promedio.

1. Crear movimiento de entrada:
   - Tipo: `entrada`
   - SubTipo: `devolucion_venta`
   - Bodega destino: (la misma)
   - Detalle: 10 unidades (sin costo unitario, usa el promedio)

2. Publicar el movimiento

3. **Verificar**:
   - `itemBodegas.stockActual` = 120
   - `itemBodegas.costoPromedio` = 503.3333 (SIN CAMBIO)

### Escenario 5: Vista Kárdex

**Objetivo**: Verificar la vista tipo Tarjeta Kárdex.

1. Navegar a `/kardex?itemId={ID_ITEM}`

2. **Verificar columnas**:
   | Fecha | Detalle | N° Doc | Entrada | | | Salida | | | Existencia | | |
   |-------|---------|--------|---------|-----|------|--------|-----|------|------------|--------|------|
   | | | | Cant | P.U. | Valor | Cant | P.U. | Valor | Cant | P.U. | Valor |

3. **Verificar filtros**:
   - Rango de fechas
   - Bodega
   - Tipo de movimiento

4. **Verificar paginación**: Máximo 100 registros por página

### Escenario 6: Exportar CSV

**Objetivo**: Verificar exportación a CSV.

1. En vista Kárdex, hacer clic en "Exportar CSV"

2. **Verificar archivo descargado**:
   - Nombre: `kardex-{CODIGO}-{FECHA}.csv`
   - Columnas: Las 12 columnas de la vista
   - Datos: Todos los movimientos filtrados

### Escenario 7: Validación de Stock Insuficiente

**Objetivo**: Verificar que no se permiten salidas sin stock.

1. Intentar crear salida por más unidades que el stock disponible

2. **Verificar error**: "Stock insuficiente. Disponible: X unidades"

## Datos de Prueba (Referencia del Libro)

Para replicar exactamente el ejemplo del libro de contabilidad:

| # | Operación | Cantidad | P.U. | Valor | Stock | Promedio | Valor Total |
|---|-----------|----------|------|-------|-------|----------|-------------|
| 1 | Inventario inicial | 120 | 500.00 | 60,000.00 | 120 | 500.00 | 60,000.00 |
| 2 | Compra | 60 | 510.00 | 30,600.00 | 180 | 503.33 | 90,600.00 |
| 3 | Compra | 80 | 490.00 | 39,200.00 | 260 | 499.23 | 129,800.00 |
| 4 | Venta | 70 | 499.23 | 34,946.10 | 190 | 499.23 | 94,853.90 |
| 5 | Dev. Venta | 10 | 499.23 | 4,992.30 | 200 | 499.23 | 99,846.20 |
| 6 | Compra | 40 | 520.00 | 20,800.00 | 240 | 502.69 | 120,646.20 |
| 7 | Dev. Compra | 15 | 502.69 | 7,540.35 | 225 | 502.69 | 113,105.85 |
| 8 | Venta | 80 | 502.69 | 40,215.20 | 145 | 502.69 | 72,890.65 |

## API Endpoints

### Consultar Kárdex

```bash
curl -X GET "http://localhost:3000/api/kardex?itemId=ITEM_ID&bodegaId=BODEGA_ID" \
  -H "Authorization: Bearer TOKEN"
```

### Exportar CSV

```bash
curl -X GET "http://localhost:3000/api/kardex/export?itemId=ITEM_ID" \
  -H "Authorization: Bearer TOKEN" \
  -o kardex.csv
```

### Consultar Auditoría

```bash
curl -X GET "http://localhost:3000/api/kardex/auditoria?itemId=ITEM_ID" \
  -H "Authorization: Bearer TOKEN"
```

## Verificación de Éxito

La implementación es correcta si:

- [ ] Los cálculos coinciden con la tabla de referencia (diferencia máxima $0.01)
- [ ] Solo las entradas tipo "compra" recalculan el promedio
- [ ] Salidas, devoluciones y transferencias usan el promedio actual
- [ ] La vista Kárdex muestra las 12 columnas correctamente
- [ ] Los filtros funcionan (fecha, bodega, tipo)
- [ ] La paginación limita a 100 registros
- [ ] El CSV se exporta correctamente
- [ ] Cada cambio de costo queda registrado en auditoría
- [ ] El sistema rechaza salidas sin stock suficiente
